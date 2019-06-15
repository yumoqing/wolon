create view issuercrosssale_base as
select participalid,substring(producttype,1,2) as pt,sum(issueamount) as issueamount from issuerview 
group by  participalid,substring(producttype,1,2);


create view issuercrosssale as
select participalid,sum(1) crosscnt,sum(issueamount) issueamount from
issuercrosssale_base 
group by participalid;
