import { LanguageService } from 'vscode-css-languageservice'
import { HTMLDocumentRegions } from '../embeddedSupport'
import { LanguageModelCache } from '../languageModelCache'
import { LanguageMode, Position } from '../languageModes'
import { TextDocument } from 'vscode-languageserver-textdocument'

export function getCSSMode(
	cssLanguageService: LanguageService,
	documentRegions: LanguageModelCache<HTMLDocumentRegions>
): LanguageMode {
	return {
		getId() {
			return 'css'
		},

		doValidation(document: TextDocument) {
			const embedded = documentRegions.get(document).getEmbeddedDocument('css')
			const stylesheet = cssLanguageService.parseStylesheet(embedded)
			return cssLanguageService.doValidation(embedded, stylesheet)
		},

		doComplete(document: TextDocument, position: Position) {
			const embedded = documentRegions.get(document).getEmbeddedDocument('css')
			const stylesheet = cssLanguageService.parseStylesheet(embedded)
			return cssLanguageService.doComplete(embedded, position, stylesheet)
		},

		doHover(document: TextDocument, position: Position) {
			const embedded = documentRegions.get(document).getEmbeddedDocument('css')
			const stylesheet = cssLanguageService.parseStylesheet(embedded)
			return cssLanguageService.doHover(embedded, position, stylesheet)
		},

		onDocumentRemoved() {
			/* nothing to do */
		},

		dispose() {
			/* nothing to do */
		}
	}
}
