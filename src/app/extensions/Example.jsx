import React, { useState } from 'react';
import { Button, Text, Input, Stack, hubspot } from '@hubspot/ui-extensions';

hubspot.extend(({ context, runServerlessFunction, actions }) => (
  <Extension
    context={context}
    // runServerlessFunction is for private apps only
    runServerless={runServerlessFunction}
    sendAlert={actions.addAlert}
  />
));

const Extension = ({ context, runServerless, sendAlert }) => {
  const [text, setText] = useState('');

  const run = () => {
    runServerless({ name: 'myFunc', parameters: { text: text } }).then((resp) =>
      sendAlert({ message: resp.response })
    );
  };

  return (
    <>
      <Text>
        <Text format={{ fontWeight: 'bold' }}>
          Your first UI Extension is ready!
        </Text>
        Congratulations {context.user.firstName}! You just deployed your first HubSpot
        UI extension. This example demonstrates how you would send parameters from
        your React front-end to the serverless function and get a response back.
      </Text>
      <Stack>
        <Input
          name="text"
          label="Send to serverless"
          onInput={(t) => setText(t)}
        />
        <Button type="submit" onClick={run}>
          Click me
        </Button>
      </Stack>
    </>
  );
};