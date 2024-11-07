import Bool "mo:base/Bool";
import Int "mo:base/Int";

import Array "mo:base/Array";
import Buffer "mo:base/Buffer";
import Debug "mo:base/Debug";
import Hash "mo:base/Hash";
import HashMap "mo:base/HashMap";
import Iter "mo:base/Iter";
import Nat "mo:base/Nat";
import Option "mo:base/Option";
import Principal "mo:base/Principal";
import Text "mo:base/Text";
import Time "mo:base/Time";

actor {
    // Types for our discussion board
    type ThreadId = Nat;
    type Comment = {
        author: Text;
        content: Text;
        timestamp: Int;
    };

    type Thread = {
        id: ThreadId;
        title: Text;
        content: Text;
        author: Text;
        timestamp: Int;
        comments: [Comment];
    };

    // State management
    private stable var nextThreadId : Nat = 0;
    private stable var threadEntries : [(ThreadId, Thread)] = [];
    
    private var threads = HashMap.HashMap<ThreadId, Thread>(
        0, Nat.equal, Hash.hash
    );

    // Initialize threads from stable storage after upgrade
    system func postupgrade() {
        threads := HashMap.fromIter<ThreadId, Thread>(
            threadEntries.vals(), 
            threadEntries.size(), 
            Nat.equal, 
            Hash.hash
        );
    };

    // Save threads to stable storage before upgrade
    system func preupgrade() {
        threadEntries := Iter.toArray(threads.entries());
    };

    // Create a new thread
    public shared func createThread(title: Text, content: Text, author: Text) : async ThreadId {
        let threadId = nextThreadId;
        let thread : Thread = {
            id = threadId;
            title = title;
            content = content;
            author = author;
            timestamp = Time.now();
            comments = [];
        };
        threads.put(threadId, thread);
        nextThreadId += 1;
        threadId
    };

    // Get all threads
    public query func getAllThreads() : async [Thread] {
        Iter.toArray(threads.vals())
    };

    // Add a comment to a thread
    public shared func addComment(threadId: ThreadId, content: Text, author: Text) : async Bool {
        switch (threads.get(threadId)) {
            case (null) { false };
            case (?thread) {
                let comment : Comment = {
                    author = author;
                    content = content;
                    timestamp = Time.now();
                };
                let updatedComments = Array.append(thread.comments, [comment]);
                let updatedThread : Thread = {
                    id = thread.id;
                    title = thread.title;
                    content = thread.content;
                    author = thread.author;
                    timestamp = thread.timestamp;
                    comments = updatedComments;
                };
                threads.put(threadId, updatedThread);
                true
            };
        }
    };

    // Get a specific thread
    public query func getThread(threadId: ThreadId) : async ?Thread {
        threads.get(threadId)
    };
}
