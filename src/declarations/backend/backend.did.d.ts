import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface Comment {
  'content' : string,
  'author' : string,
  'timestamp' : bigint,
}
export interface Thread {
  'id' : ThreadId,
  'title' : string,
  'content' : string,
  'author' : string,
  'timestamp' : bigint,
  'comments' : Array<Comment>,
}
export type ThreadId = bigint;
export interface _SERVICE {
  'addComment' : ActorMethod<[ThreadId, string, string], boolean>,
  'createThread' : ActorMethod<[string, string, string], ThreadId>,
  'getAllThreads' : ActorMethod<[], Array<Thread>>,
  'getThread' : ActorMethod<[ThreadId], [] | [Thread]>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
