create view issuerview as select *
from product a 
	left join participals b on a.issuerid = b.participalid and b.catelogname=N'融资人'
	left join datedimension c on a.issuedate = c.odate
