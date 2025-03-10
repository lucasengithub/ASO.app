import dotenv from 'dotenv';
dotenv.config();

const port = process.env.PORT || 2030

import app from "./server"

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`)
})