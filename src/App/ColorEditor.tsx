import {
  useState,
  useEffect,
  useMemo,
  type ChangeEvent,
  type KeyboardEvent
} from "react";
import InputGroup from "react-bootstrap/InputGroup";
import Form from "react-bootstrap/Form";
import {
  rgbToHex,
  hexToRGB,
  rgbIsDisplayable,
  lchToRGB,
  wcagContrastRatio,
  RGB_WHITE,
  RGB_BLACK,
  type RGB,
  type LCH
} from "../color";
import {
  faCircleCheck,
  faCircleXmark
} from "@fortawesome/free-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

interface Props {
  rgb: RGB;
  lch: LCH;
  hue: string;
  shade: string;
  onUpdate: (rgb: RGB) => void;
}

export default function ColorEditor({
  rgb,
  lch: { l, c, h },
  hue,
  shade,
  onUpdate
}: Props) {
  const [rgbInput, setRGBInput] = useState(rgbToHex(rgb));
  const [isRGBInputValid, setIsRGBInputValid] = useState(true);
  const [lInput, setLInput] = useState(l.toFixed(2));
  const [isLInputValid, setLInputValid] = useState(true);
  const [cInput, setCInput] = useState(c.toFixed(2));
  const [isCInputValid, setCInputValid] = useState(true);
  const [hInput, setHInput] = useState(h.toFixed(2));
  const [isHInputValid, setHInputValid] = useState(true);

  const contrastRatioWhite = useMemo(() => wcagContrastRatio(rgb, RGB_WHITE), [
    rgb
  ]);
  const contrastRatioBlack = useMemo(() => wcagContrastRatio(rgb, RGB_BLACK), [
    rgb
  ]);

  const isTextWhite = contrastRatioWhite > contrastRatioBlack;
  const contrastRatio = Math.max(contrastRatioWhite, contrastRatioBlack);

  useEffect(() => {
    setRGBInput(rgbToHex(rgb));
    setIsRGBInputValid(true);
  }, [rgb]);

  useEffect(() => {
    setLInput(l.toFixed(2));
    setCInput(c.toFixed(2));
    setHInput(h.toFixed(2));
    setLInputValid(true);
    setCInputValid(true);
    setHInputValid(true);
  }, [l, c, h]);

  const handleRGBChange = (event: ChangeEvent<HTMLInputElement>) => {
    setRGBInput(event.target.value);

    try {
      const rgb = hexToRGB(event.target.value);

      if (rgbIsDisplayable(rgb)) {
        setIsRGBInputValid(true);
      } else {
        setIsRGBInputValid(false);
      }
    } catch {
      setIsRGBInputValid(false);
    }
  };

  const handleRGBBlur = () => {
    if (isRGBInputValid) {
      onUpdate(hexToRGB(rgbInput));
    }
  };

  const handleRGBKeyPress = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      handleRGBBlur();
    }
  };

  const handleLCHBlur = () => {
    if (isLInputValid && isCInputValid && isHInputValid) {
      onUpdate(
        lchToRGB({
          l: parseFloat(lInput),
          c: parseFloat(cInput),
          h: parseFloat(hInput)
        })
      );
    }
  };

  const handleLCHKeyPress = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      handleLCHBlur();
    }
  };

  const handleLCHChange = (input: string, axis: keyof LCH) => {
    const [setInput, setValid] = {
      l: [setLInput, setLInputValid] as const,
      c: [setCInput, setCInputValid] as const,
      h: [setHInput, setHInputValid] as const
    }[axis];

    setInput(input);

    try {
      const value = parseFloat(input);
      const lch = { l, c, h, [axis]: value };
      const rgb = lchToRGB(lch);

      if (rgbIsDisplayable(rgb)) {
        setValid(true);
      } else {
        setValid(false);
      }
    } catch {
      setValid(false);
    }
  };

  return (
    <div className="mt-3">
      <div
        style={{
          width: "100%",
          height: "200px",
          backgroundColor: rgbToHex(rgb),
          display: "grid",
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center",
          color: isTextWhite ? "white" : "black",
          marginBottom: "8px",
          transition: "background-color 0.5s, color 0.5s"
        }}
      >
        <div>
          <h3>
            {hue} {shade}
          </h3>

          <div>
            WCAG Contrast Ratio:{" "}
            {isTextWhite
              ? contrastRatioWhite.toFixed(2)
              : contrastRatioBlack.toFixed(2)}{" "}
            (vs. {isTextWhite ? "white" : "black"})
          </div>

          <div
            style={{
              marginTop: "8px",
              display: "grid",
              gridTemplateRows: "repeat(3, 1fr)",
              gridTemplateColumns: "repeat(3, 1fr)"
            }}
          >
            <div />
            <div>AA</div>
            <div>AAA</div>
            <div>Small Text</div>
            <div>
              <FontAwesomeIcon
                icon={contrastRatio > 4.5 ? faCircleCheck : faCircleXmark}
              />
            </div>
            <div>
              <FontAwesomeIcon
                icon={contrastRatio > 7 ? faCircleCheck : faCircleXmark}
              />
            </div>
            <div>Large Text</div>
            <div>
              <FontAwesomeIcon
                icon={contrastRatio > 3 ? faCircleCheck : faCircleXmark}
              />
            </div>
            <div>
              <FontAwesomeIcon
                icon={contrastRatio > 4.5 ? faCircleCheck : faCircleXmark}
              />
            </div>
          </div>
        </div>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 2fr",
          gridColumnGap: "16px"
        }}
      >
        <InputGroup className="mb-3">
          <InputGroup.Text>HEX</InputGroup.Text>
          <Form.Control
            value={rgbInput}
            onChange={handleRGBChange}
            onBlur={handleRGBBlur}
            onKeyPress={handleRGBKeyPress}
            isInvalid={!isRGBInputValid}
          />
        </InputGroup>

        <div
          style={{
            textAlign: "center",
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gridColumnGap: "8px"
          }}
        >
          <InputGroup className="mb-3">
            <InputGroup.Text>L</InputGroup.Text>
            <Form.Control
              value={lInput}
              onChange={event => handleLCHChange(event.target.value, "l")}
              onBlur={handleLCHBlur}
              onKeyPress={handleLCHKeyPress}
            />
          </InputGroup>

          <InputGroup className="mb-3">
            <InputGroup.Text>C</InputGroup.Text>
            <Form.Control
              value={cInput}
              onChange={event => handleLCHChange(event.target.value, "c")}
              onBlur={handleLCHBlur}
              onKeyPress={handleLCHKeyPress}
            />
          </InputGroup>

          <InputGroup className="mb-3">
            <InputGroup.Text>H</InputGroup.Text>
            <Form.Control
              value={hInput}
              onChange={event => handleLCHChange(event.target.value, "h")}
              onBlur={handleLCHBlur}
              onKeyPress={handleLCHKeyPress}
            />
          </InputGroup>
        </div>
      </div>
    </div>
  );
}
