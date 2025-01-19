export const dynamic = "force-static";

export async function GET(_request: Request) {
    return new Response("Healthy", { status: 200 });
}
