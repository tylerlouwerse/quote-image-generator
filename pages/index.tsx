import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import styles from '@/styles/Home.module.css';

// Components
import {
  BackgroundImage1,
  GradientBackgroundCon,
  FooterCon,
  FooterLink,
  QuoteGeneratorCon,
  QuoteGeneratorInnerCon,
  QuoteGeneratorTitle,
  QuoteGeneratorSubTitle,
  GenerateQuoteButton,
  GenerateQuoteButtonText,
} from '@/components/QuoteGenerator/QuoteGeneratorElements';
import QuoteGeneratorModal from '@/components/QuoteGenerator';

// Assets
import Clouds1 from '../assets/cloud-and-thunder.png';
import { API } from 'aws-amplify';
import { generateAQuote, quotesQueryName } from '@/src/graphql/queries';
import { GraphQLResult } from '@aws-amplify/api-graphql';
import { run } from 'node:test';

// inteface for our DynamoDB object
interface UpdateQuoteInfoData {
  id: string
  queryName: string;
  quotesGenerated: number;
  createdAt: string;
  updatedA: string;
}

// interface for our appsync <> lambda JSON response
interface GenerateAQuoteData {
  generateAQuote: {
    statusCode: number;
    header: { [key: string]: string },
    body: string;
  }
}

// type guard for our fetch function
function isGraphQLResultForQuotesQueryName(response: any): response is GraphQLResult<{
  quotesQueryName: {
    items: [UpdateQuoteInfoData]
  };
}> {
  return response.data && response.data.quotesQueryName && response.data.quotesQueryName.items;
}


export default function Home() {
  const [numberOfQuotes, setNumberOfQuotes] = useState<Number | null>(0);
  const [openGenerator, setOpenGenerator] = useState<boolean>(false);
  const [processingQuote, setProcessingQuote] = useState<boolean>(false);
  const [quoteReceived, setQuoteReceived] = useState<String | null>(null);

  // fetch out DynamoDB object (quotes generated)
  const updateQuoteInfo = async () => {
    try {
      const response = await API.graphql<UpdateQuoteInfoData>({
        query: quotesQueryName,
        authMode: 'AWS_IAM',
        variables: {
          queryName: "LIVE"
        }
      });

      // create type guards
      if(!isGraphQLResultForQuotesQueryName(response)) {
        throw new Error('Unexpected response from API.graphql');
      }

      if(!response.data) {
        throw new Error('Response data is undefined');
      }

      const receivedNumberOfQuotes = response.data.quotesQueryName.items[0].quotesGenerated;
      setNumberOfQuotes(receivedNumberOfQuotes);
    } catch(error) {
      console.error('Error getting quote data:', error);
    }
  }

  // get quote data when the page loads
  useEffect(() => {
    updateQuoteInfo();
  }, []);

  // functions for quote generator modal
  const handleCloseGenerator = () => {
    setOpenGenerator(false);
    setProcessingQuote(false);
    setQuoteReceived(null);
  }

  const handleOpenGenerator = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setOpenGenerator(true);
    setProcessingQuote(true);

    try {
      // run lambda function
      const runFunction = "runFunction";
      const runFunctionStringified = JSON.stringify(runFunction);
      const response = await API.graphql<GenerateAQuoteData>({
        query: generateAQuote,
        authMode: 'AWS_IAM',
        variables: {
          input: runFunctionStringified
        }
      })
      const responseStringified = JSON.stringify(response);
      const responseReStringified = JSON.stringify(responseStringified);
      const bodyIndex = responseReStringified.indexOf("body=") + 5;
      const bodyAndBase64 = responseReStringified.substring(bodyIndex);
      const bodyArray = bodyAndBase64.split(",");
      const body = bodyArray[0];

      setQuoteReceived(body);

      updateQuoteInfo();
    } catch(error) {
      console.error(error);
    } finally {
      setProcessingQuote(false);
    }
  }

  return (
    <>
      <Head>
        <title>Inspiration Quote Generator</title>
        <meta name="description" content="A project to generate quotes" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.icon" />
      </Head>
      {/* Background */}
      <GradientBackgroundCon>

        {/* Quote Generator Modal */}
        <QuoteGeneratorModal
          open={openGenerator}
          close={handleCloseGenerator}
          processingQuote={processingQuote}
          setProcessingQuote={setProcessingQuote}
          quoteReceived={quoteReceived}
          setQuoteReceived={setQuoteReceived}
        />

        {/* Quote Generator */}
        <QuoteGeneratorCon>
          <QuoteGeneratorInnerCon>
            <QuoteGeneratorTitle>
              Daily Inspiration Generator
            </QuoteGeneratorTitle>
            <QuoteGeneratorSubTitle>
              Looking for a splash of inspiration? Generate a qupte with a random inspirational quote provided by <FooterLink href="https://zenquotes.io/" target="_blank" rel="noopener noreferrer">ZenQuotes API</FooterLink>.
            </QuoteGeneratorSubTitle>
            <GenerateQuoteButton onClick={handleOpenGenerator}>
              <GenerateQuoteButtonText>
                Make a Quote
              </GenerateQuoteButtonText>
            </GenerateQuoteButton>
          </QuoteGeneratorInnerCon>
        </QuoteGeneratorCon>

        <BackgroundImage1
          src={Clouds1}
          height="300"
          alt="background-image"
        />

        <FooterCon>
          <>
            Quotes Generated: {numberOfQuotes}
            <br />
            Developed with ♥ by <FooterLink href="https://tylerlouwerse.com" target="_blank" rel="noopener noreferrer">Tyler L</FooterLink>
          </>
        </FooterCon>

      </GradientBackgroundCon>
    </>
  )
}