/**
 * Local-only entrypoint. On Vercel, `api/index.ts` exports the Express app
 * and each invocation uses lazy `connectDB()` via route middleware.
 */
import app from './app';

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
