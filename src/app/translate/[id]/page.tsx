import { api } from "@/trpc/server";
import TranslateFail from "./_components/translate-failed";
import TranslateLoading from "./_components/translate-loading";
import TranslatedDocument from "./_components/translated-document";

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
        return <TranslateFail errorMessage="No document found with this ID." />;
    }

    if (translateObject.status == "loading") {
        return <TranslateLoading translateId={translateObject.id} />;
    }

    if (translateObject.status == "failed") {
        return (
            <TranslateFail errorMessage="This translation job encountered an error." />
        );
    }

    return (
        <TranslatedDocument
            content={translateObject.translatedDoc ?? "Could not translate"}
        />
    );
}
