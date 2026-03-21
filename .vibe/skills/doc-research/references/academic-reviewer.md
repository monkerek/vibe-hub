# Academic Paper Reviewer Methodology

This reference defines the rigorous evaluation criteria and structured workflow for reviewing academic papers, mirroring the standards of top-tier AI conferences (ICML, NeurIPS, ICLR).

## Evaluation Dimensions

| Dimension | Focus Questions |
| :--- | :--- |
| **Soundness** | Are the claims supported by theoretical proofs or empirical evidence? Are there logical flaws? |
| **Novelty** | Does the paper provide a new algorithm, a new theoretical insight, or a significant application? |
| **Contribution** | How much does this move the needle in the field? Is it a "marginal" improvement or a breakthrough? |
| **Clarity** | Is the paper well-organized? Is the math notation standard? Are figures/tables easy to interpret? |
| **Reproducibility** | Is there enough detail (or code) to replicate the results? Are hyperparameters and datasets clear? |
| **Ethics** | Are there potential negative societal impacts or violations of data privacy/consent? |

## Review Workflow (The "Deep Review" Pass)

1.  **Structural Mapping**: Identify the core claim, proposed method, and experimental setup.
2.  **Technical Deep-Dive**: Analyze mathematical proofs, algorithm complexity, and derivation logic.
3.  **Empirical Validation**: Evaluate baseline comparisons and statistical significance.
4.  **The "Devil's Advocate" Pass**: Act as a skeptical reviewer to uncover hidden weaknesses or overclaims.
5.  **Synthesis**: Map findings to the structured review form.

## Scoring Scale (1-10)

- **10**: Award quality (Top 1%).
- **8**: High-quality, clear accept.
- **6**: Weak accept (Technically solid but limited impact).
- **5**: Borderline (Leaning towards accept/reject).
- **3**: Clear reject (Major technical flaws or zero novelty).

## Confidence Scale (1-5)

- **5**: Absolute certainty (Expert in the specific sub-field).
- **3**: Fairly confident (Knowledgeable but might miss subtle details).
- **1**: Low confidence (First time reviewing this specific topic).
