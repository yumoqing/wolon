create view ymindicators as
select 
a.productname
,a.indname
,a.y_dim
,a.y_indname
,a.y_indicator
,b.m_dim
,b.m_indname
,b.m_indicator
from 
(
select 
productname,indname,'年'+ indname as y_indname,b.year_value as y_dim,sum(a.indicator) y_indicator
from indicators a,datedimension b
where a.inddate = b.odate
group by productname,indname,b.year_value
) a
,
(select 
productname,indname,'月'+ indname as m_indname,b.year_value as y_dim,b.month_id as m_dim,sum(a.indicator) m_indicator
from indicators a,datedimension b
where a.inddate = b.odate
group by productname,indname,b.year_value,b.month_id
)  b
where a.productname = b.productname and a.indname = b.indname and a.y_dim = b.y_dim
