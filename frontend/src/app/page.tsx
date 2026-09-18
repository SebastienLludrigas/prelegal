import { AppGate } from "@/components/AppGate";
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
    <AppGate
      ndaStandardTermsSource={standardTermsSource}
      ndaCoverPageIntro={extractCoverPageIntro(coverPageSource)}
      ndaCoverPageFooter={extractCoverPageFooter(coverPageSource)}
      genericDocuments={readGenericDocumentSources()}
    />
  );
}
