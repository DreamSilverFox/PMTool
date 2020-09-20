import {
	createConnection,
	TextDocuments,
	Diagnostic,
	DiagnosticSeverity,
	ProposedFeatures,
	InitializeParams,
	Hover,
	DidChangeConfigurationNotification,
	CompletionItem,
	CompletionItemKind,
	MarkupContent,
	Files,
	TextDocumentPositionParams,
	TextDocumentSyncKind,
	InitializeResult
} from 'vscode-languageserver';

import {
	Position,
	TextDocument
} from 'vscode-languageserver-textdocument';


import { URI } from 'vscode-uri';
import * as path from 'path';
import * as fs from 'fs';
import * as yaml from 'yaml';

// 创建连接
const connection = createConnection(ProposedFeatures.all);

// 文档管理
const documents: TextDocuments<TextDocument> = new TextDocuments(TextDocument);

// 插件目录
let extensionPath: string;

// 文档类型
let gameType: string;

// 接收客户端初始化函数
connection.onInitialize((params: InitializeParams) => {
	const capabilities = params.capabilities; // 客户端的能力
	
	const result: InitializeResult = {
		capabilities: {
			textDocumentSync: TextDocumentSyncKind.Incremental,
			// 告诉客户端服务器支持的功能
			completionProvider: {
				resolveProvider: true, // 代码补全
			},
			hoverProvider: true // 代码悬停提示
		}
	};
	return result;
});

// 三次握手，返回信息
connection.onInitialized(() => {
	connection.window.showInformationMessage('服务端已开启');
});

// 接收插件目录
connection.onNotification("extensionPath",(params) => {
	// 插件目录
	extensionPath = params.path;
	gameType = params.type;
});

function getWordAt (str: string|undefined, pos: Position): string {
	// 文本不存在
	if (str === undefined) {
		return ''; 
	}

	const li = str.split('\n')[pos.line];
	const char = Number(pos.character) >>> 0;

    // Search for the word's beginning and end.
    const left = li.slice(0, char + 1).search(/\S+$/),
	right = li.slice(char).search(/\s/);

    // The last word in the string is a special case.
    if (right < 0) {
        return li.slice(left);
    }

    // Return the word, using the located bounds to extract it from the string.
	return li.slice(left, right + char);
	
}

// 代码提示
connection.onHover(
	(_textDocumentPosition: TextDocumentPositionParams): Hover|undefined => {
	const document = documents.get(_textDocumentPosition.textDocument.uri);
	const word = getWordAt(document?.getText(), _textDocumentPosition.position);

	// connection.console.log(path.resolve('./'));
	const fileType = URI.parse(_textDocumentPosition.textDocument.uri).path.split("/").slice(-2)[0];
	const file = path.join(extensionPath, 'data', gameType, fileType + '.yml');

	const readFile = fs.readFileSync(file, 'utf8');
	const data = yaml.parse(readFile);

	const doc: MarkupContent = {
		kind: 'markdown',
		value: [
			'# ' + word,
			data[word][0]
		].join('\n')
	};
	return {
		contents: doc
	};
});

// 启动服务器监听
documents.listen(connection);
connection.listen();