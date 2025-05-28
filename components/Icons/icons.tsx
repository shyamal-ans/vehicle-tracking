import React from "react";

export const SmartCityLogo = (props: React.SVGProps<SVGSVGElement>) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        xmlnsXlink="http://www.w3.org/1999/xlink"
        width={24}
        height={32}
        fill="none"
        {...props}
    >
        <path fill="url(#a)" d="M0 0h24v32H0z" />
        <defs>
            <pattern
                id="a"
                width={1}
                height={1}
                patternContentUnits="objectBoundingBox"
            >
                <use xlinkHref="#b" transform="matrix(.00813 0 0 .0061 0 -.006)" />
            </pattern>
            <image
                xlinkHref="data:image/png;base64,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"
                id="b"
                width={123}
                height={166}
                preserveAspectRatio="none"
            />
        </defs>
    </svg>
)

export const HamburgerOpenIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={22}
        height={22}
        fill="none"
        {...props}
    >
        <path
            stroke="#343434"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.6}
            d="M17.417 15.583H9.036M17.416 11H4.584m12.834-4.583H4.583"
        />
    </svg>
)

export const HamburgerCloseIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={22}
        height={22}
        fill="none"
        {...props}
    >
        <path
            stroke="#343434"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.6}
            d="M4.583 15.583h8.381M4.584 11h12.833M4.583 6.417h12.834"
        />
    </svg>
)

export const HamburgerHoverIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={22}
        height={22}
        fill="none"
        {...props}
    >
        <path
            stroke="#343434"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.6}
            d="M4.583 15.583h12.834M4.583 11h12.834M4.583 6.417h12.834"
        />
    </svg>
)

export const DashboardIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={14}
        height={14}
        fill="none"
        {...props}
    >
        <path
            fill="#E5E5E5"
            fillRule="evenodd"
            d="M1.938 0h-.053c-.247 0-.46 0-.647.044A1.615 1.615 0 0 0 .043 1.238C0 1.426 0 1.637 0 1.884v2.693c0 .246 0 .458.044.646a1.615 1.615 0 0 0 1.194 1.195c.188.043.399.043.647.043h2.692c.247 0 .459 0 .646-.044a1.615 1.615 0 0 0 1.195-1.194c.044-.188.044-.399.044-.646V1.884c0-.246 0-.458-.045-.646A1.615 1.615 0 0 0 5.223.043C5.036 0 4.825 0 4.577 0H1.938ZM1.49 1.092c.047-.01.119-.015.45-.015h2.584c.332 0 .403.003.45.015a.538.538 0 0 1 .398.398c.01.046.014.117.014.448v2.585c0 .331-.004.402-.015.449a.538.538 0 0 1-.399.398c-.044.01-.115.014-.448.014H1.938c-.331 0-.402-.003-.449-.015a.538.538 0 0 1-.398-.398c-.01-.044-.014-.116-.014-.448V1.938c0-.331.003-.402.015-.449a.538.538 0 0 1 .398-.398M9.477 0h-.054c-.247 0-.459 0-.646.044a1.615 1.615 0 0 0-1.195 1.194c-.044.188-.044.399-.044.646v2.693c0 .246 0 .458.045.646a1.615 1.615 0 0 0 1.194 1.195c.187.043.398.043.646.043h2.692c.247 0 .46 0 .646-.044a1.615 1.615 0 0 0 1.196-1.194C14 5.035 14 4.824 14 4.577V1.884c0-.246 0-.458-.044-.646A1.615 1.615 0 0 0 12.762.043C12.573 0 12.363 0 12.114 0H9.477Zm-.45 1.092c.047-.01.12-.015.45-.015h2.585c.331 0 .402.003.449.015a.538.538 0 0 1 .398.398c.01.046.014.117.014.448v2.585c0 .331-.004.402-.015.449a.538.538 0 0 1-.399.398c-.045.011-.116.014-.447.014H9.477c-.332 0-.403-.003-.45-.015a.538.538 0 0 1-.398-.398c-.01-.044-.014-.116-.014-.448V1.938c0-.331.004-.402.015-.449a.538.538 0 0 1 .399-.398M1.885 7.538h2.692c.247 0 .459 0 .646.044a1.615 1.615 0 0 1 1.195 1.194c.044.188.044.399.044.646v2.692c0 .247 0 .46-.045.647a1.616 1.616 0 0 1-1.194 1.195c-.187.043-.398.043-.646.043H1.885c-.247 0-.46 0-.647-.044A1.615 1.615 0 0 1 .043 12.76C0 12.573 0 12.362 0 12.115V9.421c0-.246 0-.458.044-.646a1.615 1.615 0 0 1 1.194-1.195c.188-.043.399-.043.647-.043Zm.053 1.077c-.331 0-.402.003-.449.015a.538.538 0 0 0-.398.398c-.01.044-.014.115-.014.448v2.585c0 .331.003.402.015.449a.538.538 0 0 0 .398.398c.046.01.117.014.448.014h2.585c.332 0 .403-.004.45-.015a.538.538 0 0 0 .398-.398c.01-.046.014-.117.014-.448V9.476c0-.331-.004-.403-.015-.449a.538.538 0 0 0-.399-.398c-.044-.01-.115-.014-.448-.014H1.938Zm7.539-1.077h-.054c-.247 0-.459 0-.646.044a1.615 1.615 0 0 0-1.195 1.194c-.044.188-.044.399-.044.646v2.692c0 .247 0 .46.045.647a1.615 1.615 0 0 0 1.194 1.195c.187.044.4.044.646.044h2.692c.247 0 .46 0 .646-.044a1.615 1.615 0 0 0 1.195-1.194c.044-.188.044-.4.044-.646V9.423c0-.246 0-.458-.044-.646a1.615 1.615 0 0 0-1.194-1.196c-.188-.043-.399-.043-.647-.043H9.477Zm-.45 1.092c.047-.011.12-.015.45-.015h2.585c.331 0 .402.003.449.015a.538.538 0 0 1 .398.398c.01.045.014.117.014.448v2.585c0 .331-.004.402-.015.449a.538.538 0 0 1-.399.398c-.045.01-.116.014-.447.014H9.477c-.332 0-.403-.004-.45-.015a.538.538 0 0 1-.398-.398c-.01-.045-.014-.116-.014-.448V9.476c0-.331.004-.403.015-.449a.538.538 0 0 1 .399-.398"
            clipRule="evenodd"
        />
    </svg>
)

export const FeatureAccessIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={18}
        height={18}
        fill="none"
        {...props}
    >
        <path
            fill="#fff"
            d="M5.269 3.919a.45.45 0 0 0-.638-.638L3.15 4.764l-.581-.583a.45.45 0 1 0-.638.638l.9.9a.45.45 0 0 0 .638 0l1.8-1.8Zm2.606.131a.675.675 0 1 0 0 1.35h7.65a.675.675 0 0 0 0-1.35h-7.65Zm0 4.5a.675.675 0 1 0 0 1.35h7.65a.675.675 0 0 0 0-1.35h-7.65ZM7.2 13.725a.675.675 0 0 1 .675-.675h7.65a.675.675 0 1 1 0 1.35h-7.65a.675.675 0 0 1-.675-.675ZM5.269 8.869a.45.45 0 0 0-.638-.638L3.15 9.714l-.581-.583a.45.45 0 1 0-.638.638l.9.9a.449.449 0 0 0 .638 0l1.8-1.8Zm0 3.862a.45.45 0 0 1 0 .638l-1.8 1.8a.449.449 0 0 1-.638 0l-.9-.9a.45.45 0 1 1 .638-.638l.581.583 1.481-1.483a.449.449 0 0 1 .638 0Z"
        />
    </svg>
)

export const WasteManagementIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={24}
        height={24}
        fill="none"
        {...props}
    >
        <path
            stroke="#6049E7"
            strokeLinecap="round"
            strokeMiterlimit={10}
            d="M7.143 3.429v-.286C7.143 2.512 7.655 2 8.286 2h7.143c.63 0 1.142.512 1.142 1.143v.286M5.714 6.857v2.286M8.857 6.857v2.286M12 6.857v2.286M15.143 6.857v.572M18.286 6.857v2.286"
        />
        <path
            stroke="#6049E7"
            strokeMiterlimit={10}
            d="M19.429 9.143H4.57A1.143 1.143 0 0 1 3.43 8V6.286c0-.631.511-1.143 1.142-1.143H19.43c.63 0 1.142.512 1.142 1.143V8c0 .631-.511 1.143-1.142 1.143Z"
        />
        <path
            stroke="#6049E7"
            strokeLinecap="round"
            strokeMiterlimit={10}
            d="M5.714 9.143v10.571A2.286 2.286 0 0 0 8 22h8a2.286 2.286 0 0 0 2.286-2.286V9.143"
        />
        <path
            stroke="#6049E7"
            strokeLinecap="round"
            strokeMiterlimit={10}
            d="m15.161 16.811.79 1.368a.363.363 0 0 1-.315.545H11.5"
        />
        <path
            stroke="#6049E7"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeMiterlimit={10}
            d="M12.502 17.72 11.5 18.725l1.003 1.003"
        />
        <path
            stroke="#6049E7"
            strokeLinecap="round"
            strokeMiterlimit={10}
            d="m10.898 13.247.79-1.367a.363.363 0 0 1 .63 0l2.068 3.582"
        />
        <path
            stroke="#6049E7"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeMiterlimit={10}
            d="m13.015 15.095 1.37.367.368-1.37"
        />
        <path
            stroke="#6049E7"
            strokeLinecap="round"
            strokeMiterlimit={10}
            d="M9.943 18.721h-1.58a.363.363 0 0 1-.314-.544l2.069-3.583"
        />
        <path
            stroke="#6049E7"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeMiterlimit={10}
            d="m10.485 15.964-.367-1.37-1.37.367"
        />
    </svg>
)

export const ElectricityManagementIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={24}
        height={24}
        fill="none"
        {...props}
    >
        <path fill="#6049E7" d="m12.5 6-3 4.5h2v3l3-4.5h-2V6Z" />
        <path
            fill="#6049E7"
            fillRule="evenodd"
            d="M18.955 9.636a6.786 6.786 0 0 1-1.491 3.508c-.481.588-1.704 2.266-1.964 3.356h-7c-.26-1.091-1.484-2.77-1.965-3.357a6.785 6.785 0 0 1-1.49-3.509 6.735 6.735 0 0 1 .646-3.747 6.9 6.9 0 0 1 2.583-2.835A7.1 7.1 0 0 1 12 2a7.1 7.1 0 0 1 3.727 1.054 6.9 6.9 0 0 1 2.582 2.835 6.735 6.735 0 0 1 .645 3.747ZM14.792 15.5H9.207a10.557 10.557 0 0 0-.763-1.402c-.348-.55-.728-1.08-1.136-1.588a5.785 5.785 0 0 1-1.27-2.992 5.735 5.735 0 0 1 .55-3.19 5.9 5.9 0 0 1 2.21-2.425A6.1 6.1 0 0 1 12 3c1.135 0 2.245.314 3.203.905a5.9 5.9 0 0 1 2.209 2.424c.485.989.676 2.097.549 3.192a5.786 5.786 0 0 1-1.273 2.99 16.981 16.981 0 0 0-1.135 1.588c-.265.418-.55.91-.763 1.401Z"
            clipRule="evenodd"
        />
        <path
            fill="#6049E7"
            d="M8.5 18a.5.5 0 0 1 .5-.5h6a.5.5 0 0 1 0 1H9a.5.5 0 0 1-.5-.5Z"
        />
        <path
            fill="#6049E7"
            fillRule="evenodd"
            d="M8.5 19.5h7V21a1 1 0 0 1-1 1h-5a1 1 0 0 1-1-1v-1.5Zm1 1h5v.5h-5v-.5Z"
            clipRule="evenodd"
        />
    </svg>
)

export const GasPipeManagementIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={24}
        height={24}
        fill="none"
        {...props}
    >
        <path
            fill="#6049E7"
            stroke="#fff"
            strokeWidth={0.2}
            d="M10.9 2.1v2h2.2v-2h1.8v2H16A3.9 3.9 0 0 1 19.9 8v10a3.9 3.9 0 0 1-3.9 3.9H8A3.9 3.9 0 0 1 4.1 18V8A3.9 3.9 0 0 1 8 4.1h1.1v-2h1.8ZM8 5.9c-1.155 0-2.1.945-2.1 2.1v10c0 1.155.945 2.1 2.1 2.1h8c1.155 0 2.1-.945 2.1-2.1V8c0-1.155-.945-2.1-2.1-2.1H8Zm3.999 6.002c.984 1.141 1.582 1.789 1.938 2.286.181.252.296.459.366.666.07.208.097.42.097.686 0 1.303-1.074 2.36-2.4 2.36-1.326 0-2.4-1.057-2.4-2.36 0-.263.026-.473.094-.679.069-.205.181-.411.36-.663.354-.495.951-1.146 1.945-2.296ZM15.9 8.1v1.8H8.1V8.1h7.8Z"
        />
    </svg>
)

export const ExpandAllIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={16}
        height={16}
        fill="none"
        {...props}
    >
        <path
            fill="#343434"
            d="m8 12.767 2.583-2.584a.64.64 0 0 1 .467-.2.64.64 0 0 1 .467.2.65.65 0 0 1 .2.476.647.647 0 0 1-.2.474L8.95 13.717A1.29 1.29 0 0 1 8 14.1a1.29 1.29 0 0 1-.95-.383l-2.583-2.584a.621.621 0 0 1-.192-.474.68.68 0 0 1 .208-.476.648.648 0 0 1 .476-.2c.183 0 .341.067.474.2L8 12.767Zm0-9.534L5.433 5.8a.612.612 0 0 1-.466.192A.7.7 0 0 1 4.5 5.8a.678.678 0 0 1-.208-.475.624.624 0 0 1 .191-.475L7.05 2.283A1.29 1.29 0 0 1 8 1.9c.378 0 .694.128.95.383l2.567 2.567a.622.622 0 0 1 .192.475.675.675 0 0 1-.209.475.705.705 0 0 1-.467.192.609.609 0 0 1-.466-.192L8 3.233Z"
        />
    </svg>
)

export const CollapseAllIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={16}
    height={16}
    fill="none"
    {...props}
  >
    <path
      fill="#343434"
      d="M3.683 2.759a.75.75 0 0 0 .076 1.058l3.75 3.25a.75.75 0 0 0 .982 0l3.75-3.25a.75.75 0 1 0-.982-1.134L8 5.508 4.741 2.683a.75.75 0 0 0-1.058.076Zm0 10.482a.75.75 0 0 1 .076-1.058l3.75-3.25a.75.75 0 0 1 .982 0l3.75 3.25a.75.75 0 0 1-.982 1.134L8 10.492l-3.259 2.825a.75.75 0 0 1-1.058-.076Z"
    />
  </svg>
)