const vscode = require('vscode');

const isBadContent = (content: string) => {
  // content doesn't exist/looks like a multiline function
  if (!content || !content.split(/\).$/) || content.trim() === '{') {
    vscode.window.showInformationMessage('Selected line is not in a 1 liner format');
    return true;
  }
};

const verifyAndTransformParams = (params: string) => {
  params = params.trim();
  if (params.includes('(') || params.includes(')') || params.split(',').length === 1) {
    return params;
  }

  return `(${params})`;
};

export function transformToMutiline(tabNum: number, text: string, semicolonEnding: string = ';'): string {
  let headerWithParams, header, content, params, initialValue;
  [headerWithParams, content] = text.split(/=>(.+)/);
  const functionStartPos = headerWithParams.lastIndexOf('(');
  if (isBadContent(content)) {
    return '';
  }
  // split and get params without the paranthesis
  [header, params] = [headerWithParams.slice(0, functionStartPos), headerWithParams.slice(functionStartPos + 1)];

  const openBracketsNum = headerWithParams.split('(').length - headerWithParams.split(')').length;
  for (let i = openBracketsNum; i > 0; i--) {
    // remove trailing ')' and ');'
    content = content.substr(0, content.lastIndexOf(')'));
  }
  [content, initialValue] = content.split(',');
  initialValue = initialValue !== undefined ? ', ' + initialValue.trim() : '';

  const startColWithText = '\t'.repeat(tabNum);
  params = verifyAndTransformParams(params);
  const newHeader = `${header}(${params} => {\n${startColWithText}\t\n`;
  const newContent = `${startColWithText}\treturn ${content.trim()};\n`;
  const footer = `${startColWithText}}${initialValue}${')'.repeat(openBracketsNum)}${semicolonEnding}`;

  return newHeader + newContent + footer;
}

export function functionEndsWith(editor: any, line: number): string {
  const maxLine = editor.visibleRanges[0].end.line;
  const currentLineText = editor.document.lineAt(line).text.trim();
  const endsWithContinuation = ['.', ','].find(lineEnd => currentLineText.endsWith(lineEnd));
  if (endsWithContinuation) {
    return endsWithContinuation;
  }

  line++;
  while (line <= maxLine && !editor.document.lineAt(line).text.trim()) {
    line++;
  }

  if (line <= maxLine && editor.document.lineAt(line).text.trim().startsWith('.')) {
    return '';
  }

  return ';';
}

export function activate(context: any) {
  const insertLogStatement = vscode.commands.registerCommand('extension.arrowFunctionConverter', () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      return;
    }
    const line = editor.selection.active.line;
    const text = editor.document.lineAt(line).text;
    const col = text.search(/[^\s]/);
    const tabSize = editor.options.tabSize;
    const tabNum = editor.options.insertSpaces ? Math.floor(col / tabSize) : col;
    const semicolonEnding = functionEndsWith(editor, line);

    const multilineFunc = transformToMutiline(tabNum, text, semicolonEnding);
    if (!multilineFunc) {
      return;
    }

    editor.edit((editBuilder: any) => {
        editBuilder.replace(new vscode.Range(line, 0, line, 9999), multilineFunc);
      })
      .then(() => {
        const position = editor.selection.active;
        const startCol = editor.options.insertSpaces ? col + tabSize : col + 1;
        const newPosition = position.with(line + 1, startCol);
        editor.selection = new vscode.Selection(newPosition, newPosition);
      });
  });
  context.subscriptions.push(insertLogStatement);
}

export function deactivate() {}
