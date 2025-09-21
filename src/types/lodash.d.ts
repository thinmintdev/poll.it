// Type declarations for lodash modules

declare module 'lodash.debounce' {
  function debounce<T extends (...args: unknown[]) => unknown>(
    func: T,
    wait?: number,
    options?: {
      leading?: boolean;
      maxWait?: number;
      trailing?: boolean;
    }
  ): T & {
    cancel(): void;
    flush(): ReturnType<T>;
  };
  export = debounce;
}

declare module 'lodash.throttle' {
  function throttle<T extends (...args: unknown[]) => unknown>(
    func: T,
    wait?: number,
    options?: {
      leading?: boolean;
      trailing?: boolean;
    }
  ): T & {
    cancel(): void;
    flush(): ReturnType<T>;
  };
  export = throttle;
}