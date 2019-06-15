create view indicatorview as
select 
productname,
indname,
dimension as dimension,
indicator,
l_indicator,
case when l_indicator is null then null
     when l_indicator = 0 then null
     else (indicator - l_indicator)/l_indicator * 100
end as inc_pz
from (
select
a.productname,
a.indname,
a.y_dim as dimension,
sum(a.y_indicator) as indicator,
sum(c.y_indicator) as l_indicator
from ymindicators a left join (select distinct year_value,last_year_id from datedimension) b on a.y_dim = b.year_value
	left join ymindicators c on b.last_year_id = c.y_dim and a.productname=c.productname and a.indname = c.indname
group by a.productname,a.indname,a.y_dim 
) a
union 
select 
productname,
indname,
dimension as dimension,
indicator,
l_indicator,
case when l_indicator is null then null
     when l_indicator = 0 then null
     else (indicator - l_indicator)/l_indicator * 100
end as inc_pz
from (
select
a.productname,
a.indname,
a.m_dim as dimension,
sum(a.m_indicator) as indicator,
sum(c.m_indicator) as l_indicator
from ymindicators a left join (select distinct month_id,l_month_id from datedimension) b on a.m_dim = b.month_id
	left join ymindicators c on b.l_month_id = c.m_dim and a.productname=c.productname and a.indname = c.indname
group by a.productname,a.indname,a.m_dim 
) a
