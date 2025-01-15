import { api } from "@/trpc/server";

export default async function Translate({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const translateId = (await params).id;
    const translateObject = await api.translationsRouter.getById({
        translateId,
    });

    if (!translateObject) {
        return <h1>No document found with this id</h1>;
    }

    if (translateObject.status == "loading") {
        return <h1>Spinner</h1>;
    }

    if (translateObject.status == "failed") {
        return <h1>This translation encountered an error please try again</h1>;
    }

    return <h1>Translated Document</h1>;
}
