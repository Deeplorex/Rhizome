import { Boxes } from "lucide-react";

export function ProjectLogo({ logo, size = 24 }: { logo?: string; size?: number }) {
  return logo ? (
    <img className="project-logo" src={logo} alt="" width={size} height={size} />
  ) : (
    <Boxes size={size} aria-hidden="true" />
  );
}
