import * as vm from 'vm';

export class Sandbox {
  private readonly context: vm.Context;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(private readonly sandbox: Record<string, any>) {
    this.context = vm.createContext(sandbox);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  runScript(code: string): any {
    const script = new vm.Script(code);
    return script.runInContext(this.context);
  }
}
