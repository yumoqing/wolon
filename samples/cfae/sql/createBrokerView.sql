create view brokerview as select *
from product a 
	left join participals b on a.brokerid = b.participalid and b.catelogname=N'主承人'
	left join datedimension c on a.issuedate = c.odate