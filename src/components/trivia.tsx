import React, { useState } from 'react';

// TypeScript declarations
declare global {
  interface Window {
    claude?: {
      complete: (prompt: string) => Promise<string>;
    };
  }
}

interface TriviaQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  category: string;
}

interface Answer {
  questionIndex: number;
  selectedAnswer: number;
  isCorrect: boolean;
}

const TRANSLATIONS = {
  "en-US": {
    "triviaTitle": "Trivia",
    "triviaSubtitle": "Test your knowledge with Claude-generated trivia questions",
    "categoriesTitle": "Categories",
    "difficultyTitle": "Difficulty",
    "numQuestionsTitle": "Number of questions",
    "startGameButton": "Start game",
    "generatingQuestionsTitle": "Generating questions...",
    "generatingQuestionsSubtitle": "Preparing your trivia challenge",
    "questionOf": "Question",
    "of": "of",
    "score": "Score:",
    "checkAnswerButton": "Check answer",
    "nextQuestionButton": "Next question",
    "finishGameButton": "Finish game",
    "resultsTitle": "Results",
    "correct": "Correct",
    "excellentMessage": "🏆 Excellent!",
    "goodJobMessage": "👍 Good job!",
    "notBadMessage": "👌 Not bad!",
    "keepStudyingMessage": "📚 Keep studying!",
    "yourAnswer": "Your answer:",
    "correctAnswer": "Correct answer:",
    "playAgainButton": "Play again",
    "selectCategoryAlert": "Please select at least one category!",
    "selectAnswerAlert": "Please select an answer!",
    "generateQuestionsError": "Failed to generate questions. Please try again.",
    "easy": "easy",
    "medium": "medium",
    "hard": "hard"
  },
  /* LOCALE_PLACEHOLDER_START */
  "es-ES": {
    "triviaTitle": "Trivia",
    "triviaSubtitle": "Pon a prueba tus conocimientos con preguntas de trivia generadas por Claude",
    "categoriesTitle": "Categorías",
    "difficultyTitle": "Dificultad",
    "numQuestionsTitle": "Número de preguntas",
    "startGameButton": "Comenzar juego",
    "generatingQuestionsTitle": "Generando preguntas...",
    "generatingQuestionsSubtitle": "Preparando tu desafío de trivia",
    "questionOf": "Pregunta",
    "of": "de",
    "score": "Puntuación:",
    "checkAnswerButton": "Verificar respuesta",
    "nextQuestionButton": "Siguiente pregunta",
    "finishGameButton": "Terminar juego",
    "resultsTitle": "Resultados",
    "correct": "Correcto",
    "excellentMessage": "🏆 ¡Excelente!",
    "goodJobMessage": "👍 ¡Buen trabajo!",
    "notBadMessage": "👌 ¡No está mal!",
    "keepStudyingMessage": "📚 ¡Sigue estudiando!",
    "yourAnswer": "Tu respuesta:",
    "correctAnswer": "Respuesta correcta:",
    "playAgainButton": "Jugar de nuevo",
    "selectCategoryAlert": "¡Por favor selecciona al menos una categoría!",
    "selectAnswerAlert": "¡Por favor selecciona una respuesta!",
    "generateQuestionsError": "Error al generar preguntas. Por favor inténtalo de nuevo.",
    "easy": "fácil",
    "medium": "medio",
    "hard": "difícil"
  }
  /* LOCALE_PLACEHOLDER_END */
};

const appLocale = '{{APP_LOCALE}}';
const browserLocale = navigator.languages?.[0] || navigator.language || 'en-US';
const findMatchingLocale = (locale: string): string => {
  if ((TRANSLATIONS as any)[locale]) return locale;
  const lang = locale.split('-')[0];
  const match = Object.keys(TRANSLATIONS).find(key => key.startsWith(lang + '-'));
  return match || 'en-US';
};
const locale = (appLocale !== '{{APP_LOCALE}}') ? findMatchingLocale(appLocale) : findMatchingLocale(browserLocale);
const t = (key: string): string => (TRANSLATIONS as any)[locale]?.[key] || (TRANSLATIONS as any)['en-US'][key] || key;

const TriviaGame = () => {
  const [gameState, setGameState] = useState<'setup' | 'loading' | 'playing' | 'results'>('setup');
  const [categories, setCategories] = useState<string[]>([]);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [numQuestions, setNumQuestions] = useState<number>(5);
  const [questions, setQuestions] = useState<TriviaQuestion[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<number>(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState<number>(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [showAnswer, setShowAnswer] = useState<boolean>(false);

  const availableCategories = [
    'Science', 'History', 'Geography', 'Sports', 'Movies', 'Music', 
    'Literature', 'Art', 'Technology', 'Food', 'Animals', 'Space'
  ];

  const toggleCategory = (category: string) => {
    setCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const generateQuestions = async () => {
    if (categories.length === 0) {
      alert(t('selectCategoryAlert'));
      return;
    }

    // Check if Claude API is available
    if (typeof window === 'undefined' || !window.claude || !window.claude.complete) {
      alert('Claude API is not available. This trivia feature requires the Claude API to generate questions.');
      return;
    }

    setGameState('loading');
    
    try {
      const categoriesStr = categories.join(', ');
      const prompt = `Generate exactly ${numQuestions} trivia questions with the following specifications:
- Categories: ${categoriesStr}
- Difficulty: ${difficulty}
- Format: Multiple choice with 4 options

Please respond in ${locale} language.

Respond ONLY with a valid JSON object in this exact format:
{
  "questions": [
    {
      "question": "What is the chemical symbol for gold?",
      "options": ["Au", "Ag", "Go", "Gd"],
      "correctAnswer": 0,
      "category": "Science"
    }
  ]
}

Make sure each question has exactly 4 plausible options and the correctAnswer is the index (0-3) of the correct option.
DO NOT OUTPUT ANYTHING OTHER THAN VALID JSON. Your entire response must be a single, valid JSON object.`;

      const response = await window.claude.complete(prompt);
      const jsonResponse = JSON.parse(response);
      
      if (jsonResponse.questions && Array.isArray(jsonResponse.questions)) {
        setQuestions(jsonResponse.questions);
        setGameState('playing');
        setCurrentQuestion(0);
        setScore(0);
        setAnswers([]);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Error generating questions:', error);
      alert(t('generateQuestionsError'));
      setGameState('setup');
    }
  };

  const selectAnswer = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
  };

  const nextQuestion = () => {
    if (selectedAnswer === null) {
      alert(t('selectAnswerAlert'));
      return;
    }

    if (!showAnswer) {
      // First click - show the answer
      setShowAnswer(true);
      return;
    }

    // Second click - move to next question
    const isCorrect = selectedAnswer === questions[currentQuestion].correctAnswer;
    const newAnswers = [...answers, {
      questionIndex: currentQuestion,
      selectedAnswer,
      isCorrect
    }];
    
    setAnswers(newAnswers);
    
    if (isCorrect) {
      setScore(score + 1);
    }
    
    if (currentQuestion + 1 < questions.length) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowAnswer(false);
    } else {
      setGameState('results');
    }
  };

  const resetGame = () => {
    setGameState('setup');
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setScore(0);
    setAnswers([]);
    setQuestions([]);
    setShowAnswer(false);
  };

  if (gameState === 'setup') {
    return (
      <div className="bg-poll-dark text-poll-grey-100">
        {/* Logo and Header Section */}
        <div className="w-full text-center py-14">
          <h1 className="text-6xl font-bold mb-2">
            Triv<span className="text-white">.ai</span>
          </h1>
          <p className="text-poll-grey-400 text-2xl">
            {t('triviaSubtitle')}
          </p>
        </div>
        
        <div className="container max-w-2xl mx-auto px-4 py-6">

          <div className="bg-poll-grey-800/50 border border-poll-grey-700 rounded-2xl p-8 shadow-2xl">
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4 text-[#14b8a6]">{t('categoriesTitle')}</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {availableCategories.map(category => (
                  <button
                    key={category}
                    onClick={() => toggleCategory(category)}
                    className={`p-3 rounded-xl font-semibold transition-all duration-200 border-2 ${
                      categories.includes(category)
                        ? 'bg-[#14b8a6] text-black border-[#14b8a6] shadow-lg'
                        : 'bg-poll-grey-700 text-white border-poll-grey-600 hover:border-[#14b8a6] hover:bg-poll-grey-600'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4 text-[#14b8a6]">{t('difficultyTitle')}</h2>
              <div className="flex gap-3">
                {(['easy', 'medium', 'hard'] as const).map(diff => (
                  <button
                    key={diff}
                    onClick={() => setDifficulty(diff)}
                    className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 border-2 capitalize ${
                      difficulty === diff
                        ? 'bg-[#14b8a6] text-black border-[#14b8a6] shadow-lg'
                        : 'bg-poll-grey-700 text-white border-poll-grey-600 hover:border-[#14b8a6] hover:bg-poll-grey-600'
                    }`}
                  >
                    {t(diff)}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4 text-[#14b8a6]">{t('numQuestionsTitle')}</h2>
              <div className="flex gap-3">
                {[5, 10, 15, 20].map(num => (
                  <button
                    key={num}
                    onClick={() => setNumQuestions(num)}
                    className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 border-2 ${
                      numQuestions === num
                        ? 'bg-[#14b8a6] text-black border-[#14b8a6] shadow-lg'
                        : 'bg-poll-grey-700 text-white border-poll-grey-600 hover:border-[#14b8a6] hover:bg-poll-grey-600'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={generateQuestions}
              className="w-full bg-[#14b8a6] hover:bg-[#0d9488] text-black font-black py-4 px-8 rounded-xl text-xl transition-all duration-200 shadow-xl"
            >
              {t('startGameButton')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (gameState === 'loading') {
    return (
      <div className="bg-poll-dark text-poll-grey-100">
        {/* Logo and Header Section */}
        <div className="w-full text-center py-14">
          <h1 className="text-6xl font-bold mb-2">
            Triv<span className="text-white">.ai</span>
          </h1>
          <p className="text-poll-grey-400 text-2xl">
            {t('triviaSubtitle')}
          </p>
        </div>
        
        <div className="container max-w-2xl mx-auto px-4 py-6 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin w-16 h-16 border-4 border-[#14b8a6] border-t-transparent rounded-full mx-auto mb-4"></div>
            <h2 className="text-2xl font-bold text-[#14b8a6]">{t('generatingQuestionsTitle')}</h2>
            <p className="text-poll-grey-400">{t('generatingQuestionsSubtitle')}</p>
          </div>
        </div>
      </div>
    );
  }

  if (gameState === 'playing') {
    const question = questions[currentQuestion];
    return (
      <div className="bg-poll-dark text-poll-grey-100">
        {/* Logo and Header Section */}
        <div className="w-full text-center py-14">
          <h1 className="text-6xl font-bold mb-2">
            Triv<span className="text-white">.ai</span>
          </h1>
          <p className="text-poll-grey-400 text-2xl">
            {t('triviaSubtitle')}
          </p>
        </div>
        
        <div className="container max-w-3xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center mb-6">
            <div className="text-[#14b8a6] font-bold text-lg">
              {t('questionOf')} {currentQuestion + 1} {t('of')} {questions.length}
            </div>
            <div className="text-[#14b8a6] font-bold text-lg">
              {t('score')} {score}
            </div>
          </div>

          <div className="bg-poll-grey-800/50 border border-poll-grey-700 rounded-2xl p-8 shadow-2xl">
            <div className="mb-6">
              <span className="inline-block px-3 py-1 bg-[#14b8a6] text-black rounded-full text-sm font-semibold mb-4">
                {question.category}
              </span>
              <h2 className="text-2xl font-bold leading-relaxed">{question.question}</h2>
            </div>

            <div className="space-y-4 mb-8">
              {question.options.map((option, index) => {
                let buttonClass = 'w-full p-4 rounded-xl font-semibold text-left transition-all duration-200 border-2 ';
                let showCheckmark = false;
                
                if (showAnswer) {
                  if (index === question.correctAnswer) {
                    buttonClass += 'bg-[#14b8a6] text-black border-[#14b8a6] shadow-lg';
                    showCheckmark = selectedAnswer === question.correctAnswer;
                  } else if (index === selectedAnswer && index !== question.correctAnswer) {
                    buttonClass += 'bg-red-500 text-white border-red-400 shadow-lg';
                  } else {
                    buttonClass += 'bg-poll-grey-600 text-poll-grey-300 border-poll-grey-500';
                  }
                } else {
                  if (selectedAnswer === index) {
                    buttonClass += 'bg-[#14b8a6] text-black border-[#14b8a6] shadow-lg';
                  } else {
                    buttonClass += 'bg-poll-grey-700 text-white border-poll-grey-600 hover:border-[#14b8a6] hover:bg-poll-grey-600';
                  }
                }
                
                return (
                  <button
                    key={index}
                    onClick={() => !showAnswer && selectAnswer(index)}
                    disabled={showAnswer}
                    className={buttonClass}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-black mr-3">{String.fromCharCode(65 + index)}.</span>
                        {option}
                      </div>
                      <div className="text-black text-xl w-6 h-6 flex items-center justify-center">
                        {showCheckmark && '✓'}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            <button
              onClick={nextQuestion}
              className="w-full bg-[#14b8a6] hover:bg-[#0d9488] text-black font-black py-4 px-8 rounded-xl text-xl transition-all duration-200 shadow-xl"
            >
              {!showAnswer 
                ? t('checkAnswerButton')
                : currentQuestion + 1 === questions.length 
                ? t('finishGameButton')
                : t('nextQuestionButton')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (gameState === 'results') {
    const percentage = Math.round((score / questions.length) * 100);
    return (
      <div className="bg-poll-dark text-poll-grey-100">
        {/* Logo and Header Section */}
        <div className="w-full text-center py-14">
          <h1 className="text-6xl font-bold mb-2">
            Triv<span className="text-white">.ai</span>
          </h1>
          <p className="text-poll-grey-400 text-2xl">
            {t('triviaSubtitle')}
          </p>
        </div>
        
        <div className="container max-w-2xl mx-auto px-4 py-6">
          <div className="text-center">
            <h2 className="text-4xl font-black mb-6 text-[#14b8a6]">{t('resultsTitle')}</h2>
            
            <div className="bg-poll-grey-800/50 border border-poll-grey-700 rounded-2xl p-8 shadow-2xl mb-8">
            <div className="text-6xl font-black mb-4 text-[#14b8a6]">
              {score}/{questions.length}
            </div>
            <div className="text-2xl font-bold mb-6">
              {percentage}% {t('correct')}
            </div>
            
            <div className="text-lg mb-8">
              {percentage >= 80 ? t('excellentMessage') : 
               percentage >= 60 ? t('goodJobMessage') : 
               percentage >= 40 ? t('notBadMessage') : t('keepStudyingMessage')}
            </div>

            <div className="space-y-4 mb-8 text-left">
              {questions.map((question, index) => {
                const userAnswer = answers[index];
                const isCorrect = userAnswer && userAnswer.isCorrect;
                return (
                  <div key={index} className={`p-4 rounded-xl border-2 ${
                    isCorrect ? 'border-[#14b8a6] bg-[#14b8a6]/20' : 'border-red-400 bg-red-900/30'
                  }`}>
                    <div className="font-semibold mb-2">{question.question}</div>
                    <div className="text-sm">
                      <span className={isCorrect ? 'text-[#14b8a6]' : 'text-red-400'}>
                        {t('yourAnswer')} {question.options[userAnswer.selectedAnswer]}
                      </span>
                      {!isCorrect && (
                        <div className="text-[#14b8a6]">
                          {t('correctAnswer')} {question.options[question.correctAnswer]}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              onClick={resetGame}
              className="w-full bg-[#14b8a6] hover:bg-[#0d9488] text-black font-black py-4 px-8 rounded-xl text-xl transition-all duration-200 shadow-xl"
            >
              {t('playAgainButton')}
            </button>
          </div>
          </div>
        </div>
      </div>
    );
  }
};

export default TriviaGame;