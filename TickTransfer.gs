function createOnEditTrigger() {
  var sheet = SpreadsheetApp.getActive();
  ScriptApp.newTrigger('onEditTriggered')
      .forSpreadsheet(sheet)
      .onEdit()
      .create();
}

function onEditTriggered(e) {
  var lock = LockService.getScriptLock();
  var success = lock.tryLock(10000); // Wait up to 10 seconds for the lock

  if (!success) {
    Logger.log('Could not obtain lock after 10 seconds.');
    return;
  }

  try {
    var sheet = e.source.getActiveSheet();
    var range = e.range;

    // Check if the edited cell is in the column where checkboxes are (e.g., column G)
    if (range.getColumn() == 7) { // Assuming checkboxes are in column G
      var row = range.getRow();
      var checkboxValue = range.getValue();
      var transaction = sheet.getRange(row, 1).getValue(); // Assuming the transaction column is column A (index 1)
      var description = sheet.getRange(row, 2).getValue(); // Assuming the description column is column B (index 2)

      // Add the edit details to the queue
      var scriptProperties = PropertiesService.getScriptProperties();
      var queue = JSON.parse(scriptProperties.getProperty('editQueue') || '[]');
      queue.push({ row: row, checkboxValue: checkboxValue, transaction: transaction, description: description });
      scriptProperties.setProperty('editQueue', JSON.stringify(queue));
    }
  } finally {
    lock.releaseLock();
  }

  // Process the queue
  processQueue();
}

function processQueue() {
  var lock = LockService.getScriptLock();
  var success = lock.tryLock(10000); // Wait up to 10 seconds for the lock

  if (!success) {
    Logger.log('Could not obtain lock after 10 seconds.');
    return;
  }

  try {
    var scriptProperties = PropertiesService.getScriptProperties();
    var queue = JSON.parse(scriptProperties.getProperty('editQueue') || '[]');

    if (queue.length === 0) {
      return; // Nothing to process
    }

    var editDetails = queue.shift(); // Get the first edit from the queue
    scriptProperties.setProperty('editQueue', JSON.stringify(queue));

    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var row = editDetails.row;
    var checkboxValue = editDetails.checkboxValue;
    var transaction = editDetails.transaction;
    var description = editDetails.description;

    // Get the row data excluding the checkbox column
    var rowData = sheet.getRange(row, 1, 1, sheet.getLastColumn() - 1).getValues()[0];
    var rowRange = sheet.getRange(row, 1, 1, sheet.getLastColumn() - 1);

    // Open the target spreadsheet and sheet
    var targetSpreadsheet = SpreadsheetApp.openById('spreadsheetID'); // Replace with your target spreadsheet ID
    var targetSheet = targetSpreadsheet.getSheetByName('Sheet1'); // Replace with your target sheet name

    if (checkboxValue) {
      // Find the next available row in the target sheet
      var targetLastRow = getLastRow(targetSheet);
      var targetNextRow = targetLastRow + 1;

      // Append the row data to the target sheet
      var targetRowRange = targetSheet.getRange(targetNextRow, 1, 1, rowData.length);
      targetRowRange.setValues([rowData]);
      targetRowRange.setBackgrounds(rowRange.getBackgrounds());
      targetRowRange.setFontColors(rowRange.getFontColors());
      targetRowRange.setFontSizes(rowRange.getFontSizes());
      targetRowRange.setFontFamilies(rowRange.getFontFamilies());
      targetRowRange.setFontWeights(rowRange.getFontWeights());
      targetRowRange.setBorder(
        rowRange.getBorder()[0],
        rowRange.getBorder()[1],
        rowRange.getBorder()[2],
        rowRange.getBorder()[3],
        rowRange.getBorder()[4],
        rowRange.getBorder()[5]
      );

      // Optional: Uncheck the checkbox if you want to prevent duplicate copying
      sheet.getRange(row, 7).setValue(false);
    } else {
      // Find and delete all matching rows in the target sheet by transaction and description
      deleteMatchingRows(targetSheet, transaction, description);
    }

    // Recursively process the next item in the queue
    if (queue.length > 0) {
      Utilities.sleep(500); // Small delay to allow lock to be released
      processQueue();
    }
  } finally {
    lock.releaseLock();
  }
}

function getLastRow(sheet) {
  var lastRow = sheet.getLastRow();
  while (lastRow > 0 && !sheet.getRange(lastRow, 1).getValue()) {
    lastRow--;
  }
  return lastRow;
}

function deleteMatchingRows(sheet, transaction, description) {
  var data = sheet.getDataRange().getValues();
  for (var i = data.length - 1; i >= 0; i--) {
    if (data[i][0] === transaction && data[i][1] === description) { // Assuming the transaction column is column A (index 0) and description column is column B (index 1)
      sheet.deleteRow(i + 1);
    }
  }
}
