import { LanguageMode, LanguageService, Position } from '../languageModes'
import { TextDocument } from 'vscode-languageserver-textdocument'

export function getHTMLMode(htmlLanguageService: LanguageService): LanguageMode {
	return {
		getId() {
			return 'html'
		},

		doComplete(document: TextDocument, position: Position) {
			return htmlLanguageService.doComplete(document, position, htmlLanguageService.parseHTMLDocument(document))
		},

		doHover(document: TextDocument, position: Position) {
			return htmlLanguageService.doHover(document, position, htmlLanguageService.parseHTMLDocument(document))
		},

		onDocumentRemoved() {
			/* nothing to do */
		},

		dispose() {
			/* nothing to do */
		}
	}
}
