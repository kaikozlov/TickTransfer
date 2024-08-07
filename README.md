# TickTransfer for Google Sheets
Disclaimer: This will probably not work for your file(s) without modifications.

## What does it do?
In its current state, the script watches for changes in a checkbox column on the source spreadsheet and either copies or deletes the target row from the destination sheet. This version of the script only monitors one checkbox but can easily be modified to perform different actions based on multiple checkboxes or even a dropdown menu.

## Why?
I use multiple Google Sheets files to track and categorize spending, and I find it tedious to organize transactions manually. Monitoring the state of checkboxes added to my source sheet saves time because I don't have to open and copy information to the destination sheet every time I modify the source.

## Steps to Use
1. Select "Extensions" on the source spreadsheet, then click "Apps Script."
2. You can either upload the TickTransfer.gs file from this repository to the Apps Script editor or paste the script into the existing Code.gs file.
3. Modify the targetSpreadsheet and targetSheet values to match your destination. You can find the spreadsheet ID by looking at the URL "/d/\<ID IS HERE\>/edit?"\.
4. Save the file.
5. Create the script trigger by running the createOnEditTrigger function using the interface at the top of the page. Make sure to accept any required permissions for the script.
6. Return to your source file and tick/untick a checkbox to see if the desired behavior occurs.

## Troubleshooting
- Make sure the layout of your Google sheet is accounted for in the script (I can't make it work for you because I only have access to my own spreadsheets).
- If the row is not being copied to the destination file, double-check that you ran the trigger creation function and accepted all of the required permissions.
- If the row is being copied multiple times, ensure there is only one active trigger on the Apps Script Editor.
