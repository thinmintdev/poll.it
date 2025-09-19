import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { query } from '@/lib/database'

interface UpdateSettingsBody {
  name?: string
  image?: string | null
}

interface UserRow {
  id: string
  name: string | null
  email: string | null
  image: string | null
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

  const body: UpdateSettingsBody = await request.json()
  const { name, image } = body

    // Validate input
    if (name !== undefined && (typeof name !== 'string' || name.length > 50)) {
      return NextResponse.json(
        { error: 'Invalid name. Must be a string with max 50 characters.' },
        { status: 400 }
      )
    }

    if (image !== undefined && image !== null && typeof image !== 'string') {
      return NextResponse.json(
        { error: 'Invalid image URL. Must be a string.' },
        { status: 400 }
      )
    }

    // Build update query dynamically based on provided fields
  const updateFields: string[] = []
  const values: (string | null)[] = []
    let paramIndex = 1

    if (name !== undefined) {
      updateFields.push(`name = $${paramIndex}`)
      values.push(name)
      paramIndex++
    }

    if (image !== undefined) {
      updateFields.push(`image = $${paramIndex}`)
      values.push(image || null)
      paramIndex++
    }

    if (updateFields.length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      )
    }

    // Add user ID as the last parameter
    values.push(session.user.id)

    const updateQuery = `
      UPDATE users
      SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${paramIndex}
      RETURNING id, name, email, image
    `

  const result = await query(updateQuery, values)

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

  const updatedUser = result.rows[0] as UserRow

    return NextResponse.json({
      message: 'Settings updated successfully',
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        image: updatedUser.image
      }
    })

  } catch (error) {
    console.error('Error updating user settings:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}