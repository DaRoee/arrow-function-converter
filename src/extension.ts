const vscode = require("vscode");

const verifyParams = (params: string) => {
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
      [params, content] = content.split(/=>(.+)/);

      if (!content || !content.split(/\).$/) || content.trim() === "{") {
        return;
      }

      const actualContent = content.split(/\).$/)[0];
      const contentCol = editor.options.tabSize;
      params = verifyParams(params);
      const newHeader = `${header}(${params} => {\n\n`;
      const newContent = `${" ".repeat(contentCol)}return ${actualContent.trim()}\n`;
      const footer = `${" ".repeat(col)}});`;

      editor.edit((editBuilder: any) => {
        editBuilder.replace( new vscode.Range(line, 0, line, 9999), newHeader + newContent + footer);
      }).then(() => {
        // selection.active.character = contentCol;
        // selection.active.line = line + 1;
      });
    }
  );
  context.subscriptions.push(insertLogStatement);
}

exports.activate = activate;

function deactivate() {}
exports.deactivate = deactivate;
