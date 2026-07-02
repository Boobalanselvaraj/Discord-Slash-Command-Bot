import nacl from 'tweetnacl';

export const verifyDiscordRequest = (clientKey) => {
  return function (req, res, next) {
    const signature = req.get('X-Signature-Ed25519');
    const timestamp = req.get('X-Signature-Timestamp');

    console.log(`[Verify] Received request. Signature: ${signature ? 'Yes' : 'No'}, Timestamp: ${timestamp ? 'Yes' : 'No'}`);

    if (!signature || !timestamp || !req.rawBody) {
      console.log(`[Verify] Missing data: sig=${!!signature}, ts=${!!timestamp}, body=${!!req.rawBody}`);
      return res.status(401).send('Bad request signature');
    }

    try {
      const isVerified = nacl.sign.detached.verify(
        Buffer.from(timestamp + req.rawBody.toString('utf-8')),
        Buffer.from(signature, 'hex'),
        Buffer.from(clientKey, 'hex')
      );

      console.log(`[Verify] isVerified: ${isVerified}`);
      
      if (!isVerified) {
        return res.status(401).send('Invalid request signature');
      }
    } catch (err) {
      console.error('[Verify] Signature verification error:', err.message);
      return res.status(401).send('Invalid request signature');
    }

    next();
  };
};
