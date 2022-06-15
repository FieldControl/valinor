/* eslint-disable jsx-a11y/alt-text */
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { RiArrowDownSFill } from "react-icons/ri";
import React from "react";
import { styled, keyframes } from "@stitches/react";
import { violet, mauve } from "@radix-ui/colors";

const slideUpAndFade = keyframes({
  "0%": { opacity: 0, transform: "translateY(2px)" },
  "100%": { opacity: 1, transform: "translateY(0)" },
});

const slideRightAndFade = keyframes({
  "0%": { opacity: 0, transform: "translateX(-2px)" },
  "100%": { opacity: 1, transform: "translateX(0)" },
});

const slideDownAndFade = keyframes({
  "0%": { opacity: 0, transform: "translateY(-2px)" },
  "100%": { opacity: 1, transform: "translateY(0)" },
});

const slideLeftAndFade = keyframes({
  "0%": { opacity: 0, transform: "translateX(2px)" },
  "100%": { opacity: 1, transform: "translateX(0)" },
});

const StyledContent = styled(DropdownMenuPrimitive.Content, {
  minWidth: 150,
  marginTop: "0px",
  marginLeft: "auto",
  backgroundColor: "#12161b",
  borderRadius: 6,
  padding: 8,
  boxShadow:
    "0px 10px 38px -10px rgba(22, 23, 24, 0.35), 0px 10px 20px -15px rgba(22, 23, 24, 0.2)",
  "@media (prefers-reduced-motion: no-preference)": {
    animationDuration: "400ms",
    animationTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
    animationFillMode: "forwards",
    willChange: "transform, opacity",
    '&[data-state="open"]': {
      '&[data-side="top"]': { animationName: slideDownAndFade },
      '&[data-side="right"]': { animationName: slideLeftAndFade },
      '&[data-side="bottom"]': { animationName: slideUpAndFade },
      '&[data-side="left"]': { animationName: slideRightAndFade },
    },
  },
});

const itemStyles = {
  all: "unset",
  fontSize: 13,
  lineHeight: 1,
  color: "white",
  borderRadius: 3,
  display: "grid",
  height: 25,

  position: "relative",
  paddingTop: 5,
  paddingLeft: 5,
  paddingRight: 5,
  userSelect: "none",

  "&[data-disabled]": {
    color: mauve.mauve8,
    pointerEvents: "none",
  },

  "&:focus": {
    backgroundColor: "#388bfd",
  },
};

const StyledItem = styled(DropdownMenuPrimitive.Item, { ...itemStyles });
const StyledLabel = styled(DropdownMenuPrimitive.Label, {
  paddingLeft: 25,
  fontSize: 12,
  lineHeight: "25px",
  color: mauve.mauve11,
});

const StyledSeparator = styled(DropdownMenuPrimitive.Separator, {
  height: 1,
  backgroundColor: violet.violet6,
  margin: 5,
});

const StyledArrow = styled(DropdownMenuPrimitive.Arrow, {
  fill: "#12161b",
});

// Exports
export const DropdownMenu = DropdownMenuPrimitive.Root;
export const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;
export const DropdownMenuContent = StyledContent;
export const DropdownMenuItem = StyledItem;
export const DropdownMenuLabel = StyledLabel;
export const DropdownMenuSeparator = StyledSeparator;
export const DropdownMenuArrow = StyledArrow;

const Box = styled("div", {});
const IconButton = styled("button", {
  all: "unset",
  fontFamily: "inherit",
  borderRadius: "100%",
  height: 35,
  width: 35,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  color: "white",
  cursor: 'pointer'
});

export const DropdownMenuDemo = () => {
  return (
    <Box>
      <DropdownMenu>
        <span className="imageGithub">
          <DropdownMenuTrigger asChild>
            <IconButton aria-label="Customise options">
              <RiArrowDownSFill className="arrow" />
            </IconButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent sideOffset={5}>
            <DropdownMenuItem>Signed in as gabriel-fragoso</DropdownMenuItem>
            <DropdownMenuSeparator />

            <DropdownMenuItem>Your profile</DropdownMenuItem>
            <DropdownMenuItem>Your repositories</DropdownMenuItem>
            <DropdownMenuItem>Your codespaces</DropdownMenuItem>
            <DropdownMenuItem>Your projects</DropdownMenuItem>
            <DropdownMenuItem>Your stars</DropdownMenuItem>
            <DropdownMenuItem>Your gists</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Upgrade</DropdownMenuItem>
            <DropdownMenuItem>Feature preview</DropdownMenuItem>
            <DropdownMenuItem>Help</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Sign out</DropdownMenuItem>
            <DropdownMenuArrow offset={12} />
          </DropdownMenuContent>
        </span>
      </DropdownMenu>
    </Box>
  );
};

export default DropdownMenuDemo;
