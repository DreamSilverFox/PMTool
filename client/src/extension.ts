import * as path from 'path';
import { workspace, ExtensionContext } from 'vscode';

import {
	LanguageClient,
	LanguageClientOptions,
	ServerOptions,
	TransportKind
} from 'vscode-languageclient';

let client: LanguageClient;

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function activate(context: ExtensionContext) {
    // ck3?
    const temp = 'ck3';
    // 服务端配置
    const serverModule = context.asAbsolutePath(
        path.join('server', 'out', 'server.js')
    );
    
    const serverOptions: ServerOptions = {
        module: serverModule,
        transport: TransportKind.ipc
    };

    // 客户端配置
    const clientOptions: LanguageClientOptions = {
        // js代码触发事情
        documentSelector: [{ scheme: 'file', language: 'paradox' }],
    };

    client = new LanguageClient(
        'ParadoxLanguageServer',
        'Paradox Language Server',
        serverOptions,
        clientOptions
    );
    // 启动客户端，同时启动语言服务器
    client.start();
    
    // 发送插件目录
    client.onReady().then(() => {
        client.sendNotification("extensionPath", {
            path: context.extensionPath, 
            type: temp
        });
    });
}

export function deactivate(): Thenable<void> | undefined {
    if (!client) {
        return undefined;
    }
    return client.stop();
}