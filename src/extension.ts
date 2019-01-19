const vscode = require("vscode");

const isBadContent = (content: string) => {
  // content doesn't exist/looks like a multiline function
  if (!content || !content.split(/\).$/) || content.trim() === "{") {
    vscode.window.showInformationMessage("Selected line is not in a 1 liner format");
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
      const col = text.search(/[^\s]/);
      const tabSize = editor.options.tabSize;
      let startCol = editor.options.insertSpaces ? Math.floor(col / tabSize) : col;
    
      let headerWithParams, header, content, params;
      [headerWithParams, content] = text.split(/=>(.+)/);
      const functionStartPos = headerWithParams.lastIndexOf("(");
      if (isBadContent(content)) {
        return;
      }
      // split and get params without the paranthesis
      [header, params] = [headerWithParams.slice(0, functionStartPos), headerWithParams.slice(functionStartPos + 1)];

      // remove trailing ')' and ');'
      // const actualContent = content.substr(0, content.lastIndexOf(')'));
      const openBracketsNum = headerWithParams.split("(").length - headerWithParams.split(")").length;
      for (let i = openBracketsNum; i > 0; i--) {
        content = content.substr(0, content.lastIndexOf(')'));
      }

      const startColWithText = "\t".repeat(startCol);
      params = verifyAndTransformParams(params);
      const newHeader = `${header}(${params} => {\n\n`;
      const newContent = `${startColWithText}\treturn ${content.trim()};\n`;
      const footer = `${startColWithText}}${")".repeat(openBracketsNum)}`; // no ';' here to allow chaining

      editor.edit((editBuilder: any) => {
        editBuilder.replace(new vscode.Range(line, 0, line, 9999), newHeader + newContent + footer);
      }).then(() => {
        // selection.active.character = contentCol;
        const position = selection.active;
        const startCol = editor.options.insertSpaces ? col + tabSize : col + 1;
        const newPosition = position.with(position.line + 1, startCol);
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
