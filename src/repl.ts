import * as repl from 'repl';
import { ChatGPT } from './chatgpt'
import 'dotenv/config'

const r = repl.start();
r.context.ChatGPT = ChatGPT;
