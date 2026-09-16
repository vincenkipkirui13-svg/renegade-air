# RENEGADE AIR Website

Responsive airline website with an admin content manager.

## Key behavior
- Destination section is text-first: destination names and fares are shown without destination photos.
- The Travel Highlights section automatically displays the first 4 active gallery images with their titles/descriptions.
- The Gallery section displays the full active gallery collection.
- Images are rendered with `object-fit: contain` so the uploaded image is shown in full rather than forcibly cropped.
- Homepage shows up to 15 active reviews.
- Review display count is managed from Website Settings; the initial approval build uses 7,544.
- Booking inquiries are stored in the persistent site data file.
- Uploaded media is stored under `DATA_DIR/uploads`.

## Local run
```powershell
npm.cmd start
```
Open `http://localhost:3000`.

## Production persistence (Railway)
Mount a Railway Volume at `/data` and set:
```text
DATA_DIR=/data
```
This keeps the JSON data file and uploaded media outside the disposable application filesystem so redeploys can retain content.

Set production environment variables for `ADMIN_EMAIL`, `ADMIN_PASSWORD`, and `SESSION_SECRET` before launch.
