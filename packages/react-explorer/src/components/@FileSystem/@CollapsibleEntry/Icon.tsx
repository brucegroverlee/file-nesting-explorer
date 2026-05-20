import { MaterialIcon } from "@/components/MaterialIcon";

interface IconProps {
  open: boolean;
  type: "folder" | "file";
  /** Entry name; required for material-icon-theme lookups. */
  name: string;
}

export const Icon = ({ open, type, name }: IconProps) => {
  return <MaterialIcon name={name} type={type} open={open} />;
};
