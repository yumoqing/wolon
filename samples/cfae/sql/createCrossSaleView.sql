create view issuercrosssale as
select participalid,sum(1) crosscnt,sum(issueamount) issueamount from
(select participalid,substring(producttype,1,2) as pt,sum(issueamount) as issueamount from issuerview 
group by  participalid,substring(producttype,1,2)
) a
group by participalid