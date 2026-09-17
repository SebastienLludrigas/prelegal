import { AppGate } from "@/components/AppGate";
import { NdaCreator } from "@/components/NdaCreator";
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
      <NdaCreator
        standardTermsSource={standardTermsSource}
        coverPageIntro={extractCoverPageIntro(coverPageSource)}
        coverPageFooter={extractCoverPageFooter(coverPageSource)}
      />
    </AppGate>
  );
}
