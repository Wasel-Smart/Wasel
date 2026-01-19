// Type declarations for backend modules
declare module 'express' {
  interface Request {
    user?: any;
    body: any;
    headers: any;
  }
  interface Response {
    status(code: number): Response;
    json(obj: any): Response;
  }
  interface NextFunction {
    (error?: any): void;
  }
  interface Application {
    (req: any, res: any): void;
    use(middleware: any): void;
    use(path: string, middleware: any): void;
    post(path: string, ...handlers: any[]): void;
    get(path: string, ...handlers: any[]): void;
    listen(port: number, callback?: () => void): void;
  }
  function express(): Application;
  namespace express {
    function json(options?: any): any;
    interface Request {
      user?: any;
      body: any;
      headers: any;
    }
    interface Response {
      status(code: number): Response;
      json(obj: any): Response;
    }
    interface NextFunction {
      (error?: any): void;
    }
  }
  export = express;
}

declare module 'helmet' {
  function helmet(): any;
  export = helmet;
}

declare module 'express-rate-limit' {
  function rateLimit(options: any): any;
  export = rateLimit;
}

// Socket.IO extension
declare module 'socket.io' {
  interface Socket {
    userId?: string;
  }
  class Server {
    constructor(server: any, options?: any);
    use(fn: any): void;
    on(event: string, listener: any): void;
    to(room: string): any;
    engine: { clientsCount: number };
  }
}