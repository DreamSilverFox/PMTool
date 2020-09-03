import {
	createConnection,
	TextDocuments,
	Diagnostic,
	DiagnosticSeverity,
	ProposedFeatures,
	InitializeParams,
	DidChangeConfigurationNotification,
	CompletionItem,
	CompletionItemKind,
	TextDocumentPositionParams,
	TextDocumentSyncKind,
	InitializeResult
} from 'vscode-languageserver';

import {
	TextDocument
} from 'vscode-languageserver-textdocument';

// 创建连接
let connection = createConnection(ProposedFeatures.all);

// 接收客户端初始化函数
connection.onInitialize((params: InitializeParams) => {
    let capabilities = params.capabilities; // 客户端的能力

	const result: InitializeResult = {
		capabilities: {
			textDocumentSync: TextDocumentSyncKind.Incremental,
			// 告诉客户端服务器支持的功能
			completionProvider: {
				resolveProvider: true // 代码补全
			}
		}
	};
	return result;
});

// 三次握手，返回信息
connection.onInitialized(() => {
    connection.window.showInformationMessage('Hello World! form server side');
});