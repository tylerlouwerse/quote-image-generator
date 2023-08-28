import React, { useState, useEffect } from 'react';
import { Modal, Fade, Backdrop } from '@mui/material';
import ImageBlob from '../animations/ImageBlob';
import AnimatedDownloadButton from '../animations/AnimatedDownloadButton';

import {
  QuoteGeneratorTitle,
  QuoteGeneratorSubTitle,
  QuoteGeneratorModalCon,
  QuoteGeneratorModalInnerCon,
  ModalCircularProgress
} from './QuoteGeneratorElements';

import { ImageBlobCon } from '../animations/AnimationElements';

interface QuoteGeneratorModalProps {
  open: boolean;
  close: () => void;
  processingQuote: boolean;
  setProcessingQuote: React.Dispatch<React.SetStateAction<boolean>>;
  quoteReceived: String | null;
  setQuoteReceived: React.Dispatch<React.SetStateAction<String | null>>;
}

const style = {

}

const QuoteGenerator = ({
  open,
  close,
  processingQuote,
  setProcessingQuote,
  quoteReceived,
  setQuoteReceived,
}: QuoteGeneratorModalProps) => {
  const wiseDevQuote = 'If you can center a div, anything is possible."';
  const wiseDevQuoteAuthor = '- a wise senior software engineer';

  const [blobUrl, setBlobUrl] = useState<string | null>(null);

  // Function: Handling download of quote card
  const handleDownload = () => {
    const link = document.createElement('a');
    if(typeof blobUrl === 'string') {
      link.href = blobUrl;
      link.download = 'quote.png';
      link.click();
    }
  }

  // Function: Handle the receiving of wuote card
  useEffect(() => {
    if(quoteReceived) {
      const binaryData = Buffer.from(quoteReceived, 'base64');
      const blob = new Blob([binaryData], { type: 'image/png' });
      const blobUrlGenerated = URL.createObjectURL(blob);
      setBlobUrl(blobUrlGenerated);

      return () => {
        URL.revokeObjectURL(blobUrlGenerated);
      }
    }
  }, [quoteReceived]);

  return (
    <Modal
      id="QuoteGeneratorModal"
      aria-labelledby="spring-modal-quotegeneratormodal"
      aria-describedby="spring-modal-opens-and-closes-quote-generator"
      open={open}
      onClose={close}
      closeAfterTransition
      BackdropComponent={Backdrop}
      BackdropProps={{
          timeout: 500,
      }}
    >
      <Fade in={open}>
        <QuoteGeneratorModalCon sx={style}>
          <QuoteGeneratorModalInnerCon>
            {/** State #1: Processing request of quote + quote state is empty */}
            {(
              processingQuote === true && quoteReceived === null &&
                <>
                  <ModalCircularProgress
                    size={"8rem"}
                    thickness={2.5}
                  />
                  <QuoteGeneratorTitle>
                    Creating your quote...
                  </QuoteGeneratorTitle>
                  <QuoteGeneratorSubTitle style={{ marginTop: "20px"}}>
                    {wiseDevQuote}
                    <br />
                    <span style={{fontSize: 26}}>{wiseDevQuoteAuthor}</span>
                  </QuoteGeneratorSubTitle>
                </>
            )}
            {/** State#2: Quote Received */}
            {(
              quoteReceived !== null &&
                <>
                  <QuoteGeneratorTitle>
                    Download your quote!
                  </QuoteGeneratorTitle>
                  <QuoteGeneratorSubTitle style={{ marginTop: "20px"}}>
                    See a preview:
                  </QuoteGeneratorSubTitle>
                  <ImageBlobCon>
                    <ImageBlob
                      quoteReceived={quoteReceived}
                      blobUrl={blobUrl}
                    />
                  </ImageBlobCon>
                  <AnimatedDownloadButton
                    handleDownload={handleDownload}
                  />
                </>
            )}
          </QuoteGeneratorModalInnerCon>
        </QuoteGeneratorModalCon>
      </Fade>
    </Modal>
  )
}

export default QuoteGenerator;