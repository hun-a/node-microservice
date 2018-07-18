drop table if exists goods;

drop table if exists members;

drop table if exists purchases;

create table if not exists `goods` (
  `id` int not null auto_increment,
  `name` varchar(128) not null,
  `category` varchar(128) not null,
  `price` int not null,
  `description` text not null,
  primary key(id)
) ENGINE=InnoDB default CHARSET=utf8;

create table if not exists `members` (
  `id` int not null auto_increment,
  `username` varchar(128) not null,
  `password` varchar(128) not null,
  primary key(id),
  unique key `username` (`username`)
) ENGINE=InnoDB default CHARSET=utf8;

create table if not exists `purchases` (
  `id` int not null auto_increment,
  `userid` int not null,
  `goodsid` int not null,
  `date` datetime not null default current_timestamp,
  primary key(`id`)
) ENGINE=InnoDB default CHARSET=utf8;