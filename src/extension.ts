const vscode = require("vscode");

const isBadContent = (content: string) => {
  // content doesn't exist/looks like a multiline function
  if (!content || !content.split(/\).$/) || content.trim() === "{") {
    vscode.window.showInformationMessage("Selected line is not in a 1 liner format")
    return true;
  }
};

const verifyAndTransformParams = (params: string) => {
  params = params.trim();
  if (params.includes("(") || params.split(",").length === 1) {
    return params;
  }

  return `(${params})`;
};

function activate(context: any) {
  const insertLogStatement = vscode.commands.registerCommand("extension.arrowFunctionConverter", () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        return;
      }

      const selection = editor.selection;
      const line = selection.active.line;
      const text = editor.document.lineAt(line).text;
      const col = text.search(/\w/);

      let header;
      let content;
      let params;
      [header, content] = text.split(/\((.+)/);
      if (isBadContent(content)) return;
      [params, content] = content.split(/=>(.+)/);
      if (isBadContent(content)) return;

      // remove trailing ')' and ');'
      const actualContent = content.substr(0, content.lastIndexOf(')'))
      const tabSize = editor.options.tabSize;
      const startCol = "\t".repeat(Math.floor(col / tabSize));
      params = verifyAndTransformParams(params);
      const newHeader = `${header}(${params} => {\n\n`;
      const newContent = `${startCol}\treturn ${actualContent.trim()};\n`;
      const footer = `${startCol}})`; // no ';' here to allow chaining

      editor.edit((editBuilder: any) => {
        editBuilder.replace(new vscode.Range(line, 0, line, 9999), newHeader + newContent + footer);
      }).then(() => {
        // selection.active.character = contentCol;
        const position = selection.active;
        const newPosition = position.with(position.line + 1, col + tabSize);
        const newSelection = new vscode.Selection(newPosition, newPosition);
        editor.selection = newSelection;
      });
    }
  );
  context.subscriptions.push(insertLogStatement);
}

exports.activate = activate;

function deactivate() {}
exports.deactivate = deactivate;
