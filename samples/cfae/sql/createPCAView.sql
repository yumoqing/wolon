create view pcaview as 
SELECT SUBSTRING(producttype, 1, 2) AS producttype, issuerid, SUM(issueamount) AS issueamount
FROM   issuerview
GROUP BY SUBSTRING(producttype, 1, 2), issuerid;
