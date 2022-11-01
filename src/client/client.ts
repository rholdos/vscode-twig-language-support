import { join } from 'path'
import { LanguageClient, LanguageClientOptions, ServerOptions, TransportKind } from 'vscode-languageclient'
import { workspace } from 'vscode'

export function initLanguageClient(context) {
	const serverPath = context.asAbsolutePath(join('build', 'server', 'server.js'))
	const serverOptions: ServerOptions = {
		run: {
			module: serverPath,
			transport: TransportKind.ipc
		},
		debug: {
			module: serverPath,
			transport: TransportKind.ipc,
			options: {
				execArgv: ['--nolazy', '--inspect=6009']
			}
		}
	}

	const clientConfig = workspace.getConfiguration()
	const clientOptions: LanguageClientOptions = {
		documentSelector: [
			{
				language: 'twig',
				scheme: 'file'
			}
		],
		synchronize: {
			configurationSection: ['emmet', 'html', 'css', 'javascript']
		},
		initializationOptions: {
			clientConfig
		}
	}

	return new LanguageClient('Twig Language Support', 'Twig Language Server', serverOptions, clientOptions)
}
