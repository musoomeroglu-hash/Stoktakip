// Simple key-value store using Deno.kv if available, or a fallback memory store
// In Supabase Edge Functions, we typically use the built-in Deno.openKv()

let kv: any;

try {
    // @ts-ignore
    kv = await Deno.openKv();
} catch (e) {
    console.warn("Deno.KV not available, using memory store fallback");
    const store = new Map();
    kv = {
        get: async (key: string[]) => ({ value: store.get(key.join(":")) }),
        set: async (key: string[], value: any) => { store.set(key.join(":"), value); },
        delete: async (key: string[]) => { store.delete(key.join(":")); },
        list: async (options: any) => {
            const prefix = options.prefix.join(":");
            const results = [];
            for (const [k, v] of store.entries()) {
                if (k.startsWith(prefix)) {
                    results.push({ key: k.split(":"), value: v });
                }
            }
            return {
                async *[Symbol.asyncIterator]() {
                    for (const res of results) yield res;
                }
            };
        }
    };
}

export async function get(key: string) {
    const res = await kv.get([key]);
    return res.value;
}

export async function set(key: string, value: any) {
    await kv.set([key], value);
}

export async function del(key: string) {
    await kv.delete([key]);
}

export async function getByPrefix(prefix: string) {
    const iter = kv.list({ prefix: [prefix] });
    const results = [];
    for await (const res of iter) {
        results.push(res.value);
    }
    return results;
}
