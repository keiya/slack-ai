import * as vm from 'vm';

export class Sandbox {
  private context: vm.Context;

  constructor(private sandbox: Record<string, any>) {
    this.context = vm.createContext(sandbox);
  }

  runScript(code: string): any {
    const script = new vm.Script(code);
    return script.runInContext(this.context);
  }
}
