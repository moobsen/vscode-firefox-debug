import { DebugProtocol } from 'vscode-debugprotocol';
import { DebugSession } from 'vscode-debugadapter';

export abstract class DebugAdapterBase extends DebugSession {

	public constructor(debuggerLinesStartAt1: boolean, isServer: boolean = false) {
		super(debuggerLinesStartAt1, isServer);
	}

	protected abstract initialize(args: DebugProtocol.InitializeRequestArguments): DebugProtocol.Capabilities | undefined;
	protected abstract launch(args: DebugProtocol.LaunchRequestArguments): Promise<void>;
	protected abstract attach(args: DebugProtocol.AttachRequestArguments): Promise<void>;
	protected abstract disconnect(args: DebugProtocol.DisconnectArguments): Promise<void>;
	protected abstract setBreakpoints(args: DebugProtocol.SetBreakpointsArguments): Promise<{ breakpoints: DebugProtocol.Breakpoint[] }>;
	protected abstract setExceptionBreakpoints(args: DebugProtocol.SetExceptionBreakpointsArguments): void;
	protected abstract pause(args: DebugProtocol.PauseArguments): Promise<void>;
	protected abstract next(args: DebugProtocol.NextArguments): Promise<void>;
	protected abstract stepIn(args: DebugProtocol.StepInArguments): Promise<void>;
	protected abstract stepOut(args: DebugProtocol.StepOutArguments): Promise<void>;
	protected abstract continue(args: DebugProtocol.ContinueArguments): Promise<{ allThreadsContinued?: boolean }>;
	protected abstract getSource(args: DebugProtocol.SourceArguments): Promise<{ content: string, mimeType?: string }>;
	protected abstract getThreads(): { threads: DebugProtocol.Thread[] };
	protected abstract getStackTrace(args: DebugProtocol.StackTraceArguments): Promise<{ stackFrames: DebugProtocol.StackFrame[], totalFrames?: number }>;
	protected abstract getScopes(args: DebugProtocol.ScopesArguments): { scopes: DebugProtocol.Scope[] };
	protected abstract getVariables(args: DebugProtocol.VariablesArguments): Promise<{ variables: DebugProtocol.Variable[] }>;
	protected abstract evaluate(args: DebugProtocol.EvaluateArguments): Promise<{ result: string, type?: string, variablesReference: number, namedVariables?: number, indexedVariables?: number }>;

	protected initializeRequest(response: DebugProtocol.InitializeResponse, args: DebugProtocol.InitializeRequestArguments): void {
		this.handleRequest(response, () => this.initialize(args));
	}

	protected disconnectRequest(response: DebugProtocol.DisconnectResponse, args: DebugProtocol.DisconnectArguments): void {
		this.handleRequestAsync(response, () => this.disconnect(args));
	}

	protected launchRequest(response: DebugProtocol.LaunchResponse, args: DebugProtocol.LaunchRequestArguments): void {
		this.handleRequestAsync(response, () => this.launch(args));
	}

	protected attachRequest(response: DebugProtocol.AttachResponse, args: DebugProtocol.AttachRequestArguments): void {
		this.handleRequestAsync(response, () => this.attach(args));
	}

	protected setBreakPointsRequest(response: DebugProtocol.SetBreakpointsResponse, args: DebugProtocol.SetBreakpointsArguments): void {
		this.handleRequestAsync(response, () => this.setBreakpoints(args));
	}

	protected setExceptionBreakPointsRequest(response: DebugProtocol.SetExceptionBreakpointsResponse, args: DebugProtocol.SetExceptionBreakpointsArguments): void {
		this.handleRequest(response, () => this.setExceptionBreakpoints(args));
	}

	protected pauseRequest(response: DebugProtocol.PauseResponse, args: DebugProtocol.PauseArguments): void {
		this.handleRequestAsync(response, () => this.pause(args));
	}

	protected nextRequest(response: DebugProtocol.NextResponse, args: DebugProtocol.NextArguments): void {
		this.handleRequestAsync(response, () => this.next(args));
	}

	protected stepInRequest(response: DebugProtocol.StepInResponse, args: DebugProtocol.StepInArguments): void {
		this.handleRequestAsync(response, () => this.stepIn(args));
	}

	protected stepOutRequest(response: DebugProtocol.StepOutResponse, args: DebugProtocol.StepOutArguments): void {
		this.handleRequestAsync(response, () => this.stepOut(args));
	}

	protected continueRequest(response: DebugProtocol.ContinueResponse, args: DebugProtocol.ContinueArguments): void {
		this.handleRequestAsync(response, () => this.continue(args));
	}

	protected sourceRequest(response: DebugProtocol.SourceResponse, args: DebugProtocol.SourceArguments): void {
		this.handleRequestAsync(response, () => this.getSource(args));
	}

	protected threadsRequest(response: DebugProtocol.ThreadsResponse): void {
		this.handleRequest(response, () => this.getThreads());
	}

	protected stackTraceRequest(response: DebugProtocol.StackTraceResponse, args: DebugProtocol.StackTraceArguments): void {
		this.handleRequestAsync(response, () => this.getStackTrace(args));
	}

	protected scopesRequest(response: DebugProtocol.ScopesResponse, args: DebugProtocol.ScopesArguments): void {
		this.handleRequest(response, () => this.getScopes(args));
	}

	protected variablesRequest(response: DebugProtocol.VariablesResponse, args: DebugProtocol.VariablesArguments): void {
		this.handleRequestAsync(response, () => this.getVariables(args));
	}

	protected evaluateRequest(response: DebugProtocol.EvaluateResponse, args: DebugProtocol.EvaluateArguments): void {
		this.handleRequestAsync(response, () => this.evaluate(args));
	}

	private handleRequest<TResponse extends DebugProtocol.Response, TResponseBody>(response: TResponse, executeRequest: () => TResponseBody): void {
		try {
			response.body = executeRequest();
		} catch (err) {
			response.success = false;
			response.message = String(err);
		}
		this.sendResponse(response);
	}

	private async handleRequestAsync<TResponse extends DebugProtocol.Response, TResponseBody>(response: TResponse, executeRequest: () => Promise<TResponseBody>): Promise<void> {
		try {
			response.body = await executeRequest();
		} catch (err) {
			response.success = false;
			response.message = String(err);
		}
		this.sendResponse(response);
	}
}