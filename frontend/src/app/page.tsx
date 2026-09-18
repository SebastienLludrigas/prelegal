import { AppGate } from "@/components/AppGate";
import { DocumentCreator } from "@/components/DocumentCreator";
import { readGenericDocumentSources } from "@/lib/documents/catalogSource";
import {
  extractCoverPageFooter,
  extractCoverPageIntro,
} from "@/lib/nda/fillTemplate";
import {
  readCoverPageSource,
  readStandardTermsSource,
} from "@/lib/nda/templateSource";

export default function Home() {
  const standardTermsSource = readStandardTermsSource();
  const coverPageSource = readCoverPageSource();

  return (
    <AppGate>
      <DocumentCreator
        ndaStandardTermsSource={standardTermsSource}
        ndaCoverPageIntro={extractCoverPageIntro(coverPageSource)}
        ndaCoverPageFooter={extractCoverPageFooter(coverPageSource)}
        genericDocuments={readGenericDocumentSources()}
      />
    </AppGate>
  );
}
