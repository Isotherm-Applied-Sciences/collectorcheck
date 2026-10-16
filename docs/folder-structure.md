# Folder Structure

Selected release files in the checked-in repository. Ditto components live in `components/`; its helpers live in `utils/`.

```text
collectorcheck/
  frontend/
    package.json
    package-lock.json
    webpack.config.js
    public/
      index.html
    src/
      index.jsx
      pages/
        UploadPage.jsx
        ReceiptListPage.jsx
        ReceiptDetailPage.jsx
        VendorOverviewPage.jsx
        VendorReceiptsPage.jsx
        TagsPage.jsx
        TagReceiptsPage.jsx
        StatsPage.jsx
        TimelinePage.jsx
      components/
        Ditto.jsx
        DittoController.jsx
      context/
        DataContext.jsx
        DittoContext.jsx
      utils/
        api.js
        dittoEmotion.js
        dittoIntelligence.js
        dittoPredictive.js
      styles/
        global.css
    tests/
      ditto-boundary.test.js
  backend/
    package.json
    package-lock.json
    server.js
    src/
      index.js
      routes/
        receipts.js
        vendors.js
        tags.js
        stats.js
        timeline.js
      controllers/
        receipts.js
        vendors.js
        tags.js
        stats.js
        timeline.js
      models/
        receipt.js
        vendor.js
        tag.js
        view.js
      db/
        sqlite.js
      services/
        uploadStorage.js
      utils/
        db.js
        ocr.js
        normalize.js
        errors.js
    tests/
      endpoints.test.js
  docs/
    README.md
    API.md
    folder-structure.md
    architecture.md
    setup.md
  .gitignore
  LICENSE
  README.md
```

`backend/receipts.db`, `backend/uploads/`, dependencies, build output, and private environment files are local runtime data and are excluded from Git. The backend package name remains `collectorcheck-backend`; its directory is `backend/`.

See [developer setup](setup.md) for startup and test commands and [architecture](architecture.md) for the data flow.