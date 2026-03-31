export type NavId =
  | 'order'
  | 'business'
  | 'plans-business'
  | 'activate-service'
  | 'home'
  | 'dealers'
  | 'plans-personal'
  | 'plans'            
  | string;            // keep string if you still accept others

export type DropdownItemByPath = {
  id: string;
  label: string;
  path: string;       // e.g. "/business"
};

export type DropdownItemByTarget = {
  id: string;
  label: string;
  targetId: string;   // e.g. "plans"
};

export type DropdownItem = DropdownItemByPath | DropdownItemByTarget;
