export const idlFactory = ({ IDL }) => {
  const ThreadId = IDL.Nat;
  const Comment = IDL.Record({
    'content' : IDL.Text,
    'author' : IDL.Text,
    'timestamp' : IDL.Int,
  });
  const Thread = IDL.Record({
    'id' : ThreadId,
    'title' : IDL.Text,
    'content' : IDL.Text,
    'author' : IDL.Text,
    'timestamp' : IDL.Int,
    'comments' : IDL.Vec(Comment),
  });
  return IDL.Service({
    'addComment' : IDL.Func([ThreadId, IDL.Text, IDL.Text], [IDL.Bool], []),
    'createThread' : IDL.Func([IDL.Text, IDL.Text, IDL.Text], [ThreadId], []),
    'getAllThreads' : IDL.Func([], [IDL.Vec(Thread)], ['query']),
    'getThread' : IDL.Func([ThreadId], [IDL.Opt(Thread)], ['query']),
  });
};
export const init = ({ IDL }) => { return []; };
