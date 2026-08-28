Deployment notes (backend)

- Use MongoDB Atlas for production. Create a cluster and get the connection string.
- Set the following environment variables on Render or your host: `MONGO_URI`, `JWT_SECRET`, `PORT` (optional).
 - Set the following environment variables on Render or your host: `MONGO_URI`, `JWT_SECRET`, `PORT` (optional).
	 - Example MongoDB Atlas connection string:
		 `mongodb+srv://ibrahimjlidi23_db_user:<db_password>@cluster0.w0hb12b.mongodb.net/` (replace `<db_password>` with your DB user password).
	 - On Render set `MONGO_URI` to the full connection string (including password) in the service's Environment settings.
- Render: this repo includes `Procfile` and `render.yaml` — link the repo in Render and set the env vars.
- Local test: copy `.env.example` to `.env` and fill values, then run `npm run dev` or `npm start`.

Commands:
```powershell
cd EduInsight
npm install
npm run seed    # seed the local DB
npm start       # production start (node server.js)
```
