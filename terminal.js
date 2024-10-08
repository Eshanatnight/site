function format(string) {
	return string.replace("\n", "").replace(/\n/g, "\r\n");
}

const ABOUT = format(`
I have no idea what I'm doing.
I'm just making things up as I go.
`);

const CONTACT = format(`
Email:   eshan20012@gmail.com
Github:  https://github.com/Eshanatnight
Instagram: https://www.instagram.com/kellsatnight
LinkedIn: https://www.linkedin.com/in/eshanatnite
`);

const README = format(`
Welcome to my website.
`);

const files = {
	"about.txt": ABOUT,
	"contact.txt": CONTACT,
	"README.md": README,
};

const commands = {
	cat,
	ls,
	clear,
	help,
};

function clear(_args) {
	term.clear();
}

function ls(args) {
	if (args.length == 1 && args[0] == "-1") {
		term.writeln(Object.keys(files).join("\r\n"));
		return;
	}
	term.writeln(Object.keys(files).join(" "));
}

function help(_args) {
	term.writeln(`Commands:\r\n* ${Object.keys(commands).join("\r\n* ")}`);
}

function cat(args) {
	if (args.length !== 1) {
		term.writeln(`requires 1 argument, provided ${args.length}`);
		return;
	}
	if (!files[args[0]]) {
		term.writeln(`file not found: ${args[0]}`);
		return;
	}
	term.write(files[args[0]]);
}

const PROMPT = `$ `;
const PROMPT_LENGTH = PROMPT.replace(/\u001b\[[\d;]+m/g, "").length;

let term = new Terminal({
	cols: 80,
	rows: 15,
	fontSize: 15,
	fontFamily: "Inconsolata,Menlo,Chicago,Geneva",
	cursorBlink: true,
	theme: {
		selection: "#000",
		foreground: "#333",
		cursor: "#333",
		background: "#FFF",
	},
});

term.registerLinkMatcher(/https:\/\/\w+\.[^\s]*/, (_event, uri) =>
	window.open(uri, "_blank")
);
term.open(document.querySelector("#terminal > .modeless-dialog"));
term.write(`\r${PROMPT}`);

window.scrollTo(0, 0);

let history = [];
let pointer = 0;
let command = "";

term.onData((event) => {
	switch (event) {
		case "\r": // Enter
			execute(command);
		case "\u0003": // Ctrl+C
			command = "";
			pointer = history.length;
			term.write(`\r\n${PROMPT}`);
			break;
		case "\u0010": // Ctrl+P
			pointer = Math.max(pointer - 1, 0);
			term.write("\x1b[2K");
			term.write(`\r${PROMPT}`);
			term.write(history[pointer] || "");
			command = history[pointer] || "";
			break;
		case "\u000e": // Ctrl+N
			pointer = Math.min(pointer + 1, history.length);
			term.write("\x1b[2K");
			term.write(`\r${PROMPT}`);
			term.write(history[pointer] || "");
			command = history[pointer] || "";
			break;
		case "\u007F": // Backspace (DEL)
			if (term._core.buffer.x > PROMPT_LENGTH) {
				command = command.slice(0, -1);
				term.write("\b \b");
			}
			break;
		case "\u0015": // Ctrl+U
			command = "";
			term.write("\x1b[2K");
			term.write(`\r${PROMPT}`);
			break;
		case "\f": // Ctrl+L
			term.clear();
			break;
		default: // Print all other characters for demo
			if (event.charCodeAt(0) < 30 || event.charCodeAt(0) > 128) {
				break;
			}
			command += event;
			term.write(event);
	}
});

function execute(command) {
	history.push(command);
	term.writeln("\r");
	tokens = command.split(" ");

	if (commands[tokens[0]]) {
		commands[tokens[0]](tokens.slice(1));
	} else {
		term.writeln(
			`shell: command not found: ${command}. Try 'help' to get started.`
		);
	}
}
