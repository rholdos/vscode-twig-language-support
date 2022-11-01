import {
	ExtensionContext,
	CompletionItem,
	CompletionItemKind,
	Hover,
	IndentAction,
	languages,
	MarkdownString,
	Range,
	Position,
	SnippetString
} from 'vscode'
import { initLanguageClient } from './client/client'

import filterCompletions from './completions/filters.json'
import loopCompletions from './completions/loops.json'
import testCompletions from './completions/tests.json'

import filterHovers from './hovers/filters.json'
import functionHovers from './hovers/functions.json'
import tagHovers from './hovers/tags.json'
import testHovers from './hovers/tests.json'

const LANG = 'twig'

export function activate(context: ExtensionContext) {
	startLanguageClient(context)
	registerCompletions(context)
	registerHovers(context)
	registerLanguageRules()
}

export function deactivate(context: ExtensionContext) {
	stopLanguageClient(context)
}

/*
 * FUNCTIONS
 */

function startLanguageClient(context) {
	const languageClient = initLanguageClient(context)
	context.subscriptions.push(languageClient.start())
}

function stopLanguageClient(context) {
	const languageClient = initLanguageClient(context)
	context.subscriptions.push(languageClient.stop())
}

function registerCompletions(context) {
	const createCompletionItems = (completionsJson, completionsKind, endString) => {
		return {
			provideCompletionItems(document, position) {
				let completionItems = []
				for (const completionItem in completionsJson) {
					const { label, detail, insertText } = completionsJson[completionItem]
					let newCompletionItem = new CompletionItem(label)
					newCompletionItem.detail = detail
					newCompletionItem.insertText = new SnippetString(insertText)
					newCompletionItem.kind = completionsKind
					completionItems.push(newCompletionItem)
				}
				const text = document.getText(new Range(new Position(position.line, 0), position))
				return text.endsWith(endString) ? completionItems : []
			}
		}
	}
	context.subscriptions.push(
		languages.registerCompletionItemProvider(
			LANG,
			createCompletionItems(filterCompletions, CompletionItemKind.Method, '|'),
			'|'
		)
	)
	context.subscriptions.push(
		languages.registerCompletionItemProvider(
			LANG,
			createCompletionItems(loopCompletions, CompletionItemKind.Function, 'loop.'),
			'.'
		)
	)
	context.subscriptions.push(
		languages.registerCompletionItemProvider(
			LANG,
			createCompletionItems(testCompletions, CompletionItemKind.Field, 'is '),
			' '
		)
	)
	context.subscriptions.push(
		languages.registerCompletionItemProvider(
			LANG,
			createCompletionItems(testCompletions, CompletionItemKind.Field, 'not '),
			' '
		)
	)
}

function registerHovers(context) {
	context.subscriptions.push(
		languages.registerHoverProvider(LANG, {
			provideHover(document, position) {
				const text = document.getText(document.getWordRangeAtPosition(position))
				for (const hoversJson of [filterHovers, functionHovers, tagHovers, testHovers]) {
					for (const hoverItem in hoversJson) {
						const { prefix, name, description, body, reference } = hoversJson[hoverItem]
						if (text == prefix) {
							let content = new MarkdownString(``)
							content.isTrusted = true
							content.appendMarkdown(`**` + name + `**` + `\t\n` + description + `\t\n\t\n`)
							content.appendCodeblock(body, LANG)
							content.appendMarkdown(`***` + `\t\n` + `[Reference](` + reference + `)`)
							return new Hover(content, new Range(position, position))
						}
					}
				}
			}
		})
	)
}

function registerLanguageRules() {
	const EMPTY_TAGS: string[] = [
		'area',
		'base',
		'br',
		'col',
		'embed',
		'hr',
		'img',
		'input',
		'keygen',
		'link',
		'menuitem',
		'meta',
		'param',
		'source',
		'track',
		'wbr'
	]
	languages.setLanguageConfiguration(LANG, {
		wordPattern: /(-?\d*\.\d\w*)|([^\`\~\!\@\$\^\&\*\(\)\=\+\[\{\]\}\\\|\;\:\'\"\,\.\<\>\/\s]+)/g,
		onEnterRules: [
			{
				beforeText: new RegExp(
					`<(?!(?:${EMPTY_TAGS.join('|')}))([_:\\w][_:\\w-.\\d]*)([^/>]*(?!/)>)[^<]*$`,
					'i'
				),
				afterText: /^<\/([_:\w][_:\w-.\d]*)\s*>$/i,
				action: { indentAction: IndentAction.IndentOutdent }
			},
			{
				beforeText: new RegExp(`<(?!(?:${EMPTY_TAGS.join('|')}))(\\w[\\w\\d]*)([^/>]*(?!/)>)[^<]*$`, 'i'),
				action: { indentAction: IndentAction.Indent }
			}
		]
	})
}
